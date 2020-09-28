/* eslint-disable no-control-regex */
// DreamTime.
// Copyright (C) DreamNet. All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License 3.0 as published by
// the Free Software Foundation. See <https://www.gnu.org/licenses/gpl-3.0.html>
//
// Written by Ivan Bravo Bravo <ivan@dreamnet.tech>, 2019.

import {
  isNil, isEmpty, forIn, cloneDeep, random, toString,
  trim, kebabCase, truncate, deburr, merge,
} from 'lodash'
import Swal from 'sweetalert2/dist/sweetalert2'
import emojiStrip from 'emoji-strip'
import { ImageMagick } from '../imagemagick'
import { File } from '../file'
import { Timer } from '../timer'
import cliErrors from '../config/cli-errors.json'
import preferencesConfig from '../config/preferences.json'
import { achievements, requirements } from '../system'
import { settings, PMODE } from '../system/settings'
import { STEP } from './photo-mask'

const { getCurrentWindow } = require('electron').remote

const { power, waifu } = $provider

export const ALGORITHM = {
  NONE: -1,
  DREAMPOWER: 0,
  WAIFU2X: 1,
  DREAMTIME: 2,
}

export class PhotoRun {
  /**
   * @type {string}
   */
  id

  /**
   * @type {import('./photo').Photo}
   */
  photo

  /**
   * @type {Object}
   */
  process

  /**
   * @type {File}
   */
  outputFile

  /**
   * Mask that will be generated with this run.
   * @type {import('./photo-mask').PhotoMask}
   */
  mask

  /**
   * Indicates if this run is used to generate a custom mask.
   * @type {boolean}
   */
  get isMaskGeneration() {
    return !isNil(this.mask)
  }

  /**
   * @type {string}
   */
  status = 'pending'

  /**
   * @type {ALGORITHM}
   */
  algorithmStatus = ALGORITHM.NONE

  /**
   * @type {string}
   */
  frameStatus

  /**
   * @type {Boolean}
   */
  failed = false

  /**
   * @type {Object}
   */
  preferences = {}

  /**
   * @type {Timer}
   */
  timer = new Timer()

  /**
   * @type {Object}
   */
  cli = {
    lines: [],
    error: '',
  }

  get pending() {
    return this.status === 'pending'
  }

  get running() {
    return this.status === 'running'
  }

  get finished() {
    return this.status === 'finished'
  }

  get useUpscaling() {
    return this.preferences.advanced.waifu.enabled && requirements.canUseWaifu
  }

  get useColorPaddingRemoval() {
    return this.preferences.advanced.useColorPaddingStrip && this.preferences.advanced.scaleMode === 'padding'
  }

  get outputName() {
    const now = Date.now() + random(1, 100)
    const { file } = this.photo

    let name = deburr(file.name)
    name = emojiStrip(name)
    name = name.replace(/[^\x00-\x7F]/g, '')
    name = kebabCase(trim(name))
    name = truncate(name, { length: 20, omission: '' })

    let ext = 'png'

    if (file.isAnimated) {
      ext = file.extension
    }

    return `${name}-RUN${this.id}-${now}-dreamtime.${ext}`
  }

  /**
   * Creates an instance of PhotoRun.
   * @param {string} id
   * @param {import('./photo').Photo} photo
   * @param {string} mask
   */
  constructor(id, photo, mask) {
    this.id = id
    this.photo = photo
    this.mask = mask

    if (!this.isMaskGeneration) {
      // Output
      this.outputFile = new File(photo.getFolderPath(this.outputName))
    }

    // preferences
    this.preferences = cloneDeep(this.photo.preferences)
  }

  /**
   *
   */
  toObject() {
    return {
      photo: {
        finalFile: this.photo.finalFile,
        scaleMode: this.photo.scaleMode,
        geometry: this.photo.geometry,
        withCustomMasks: this.photo.withCustomMasks,
        masksPath: this.photo.getFilesPath(),
      },
      preferences: this.preferences,
      outputFile: this.outputFile,
      mask: this.mask,
      isMaskGeneration: this.isMaskGeneration,
    }
  }

  /**
   *
   */
  setupPreferences() {
    this.preferences = cloneDeep(this.photo.preferences)

    const { mode } = this.preferences

    // We make these changes in the run so
    // don't affect the original photo preferences.
    if (mode === PMODE.MINIMAL || mode === PMODE.SIMPLE) {
      this.preferences = merge(this.preferences, {
        body: {
          runs: {
            mode: false,
          },
        },
        advanced: {
          useColorTransfer: false,
          useColorPaddingStrip: true,
          compress: 0,
          imageSize: 512,
          waifu: {
            enabled: requirements.canUseWaifu,
            scale: 2,
            denoise: 0,
            tta: 0,
            arch: 0,
          },
        },
      })
    }

    if (mode !== PMODE.ADVANCED) {
      // Body randomize/increase.
      const { body } = this.preferences

      if (body.runs.mode === 'randomize') {
        // Randomize.
        forIn(preferencesConfig, (payload, key) => {
          const { enabled, min, max } = body[key].randomize

          if (enabled) {
            body[key].size = random(min, max, true)
          }
        })
      } else if (body.runs.mode === 'increase') {
        // Increase by Step.
        const add = body.runs.rate * (this.id - 1)

        forIn(preferencesConfig, (payload, key) => {
          if (body[key].progressive) {
            let value = Number.parseFloat(body[key].size)
            value = Math.min(value + add, payload.max)

            body[key].size = value
          }
        })
      }

      this.preferences.body = body
    }

    this.preferences.advanced.scaleMode = this.photo.scaleMode
    this.preferences.advanced.imageSize = this.photo.imageSize
  }

  /**
   *
   */
  add() {
    this.photo.addRun(this)
  }

  /**
   *
   */
  cancel() {
    this.photo.cancelRun(this)
  }

  /**
   *
   */
  async start() {
    if (this.mask === STEP.PADDING) {
      await this.runColorPaddingRemoval()
    } else if (this.mask === STEP.SCALE) {
      await this.runUpscale()
    } else if (this.isMaskGeneration) {
      await this.runNudification()
    } else {
      const result = await this.runNudification()

      if (result) {
        if (this.useColorPaddingRemoval) {
          await this.runColorPaddingRemoval()
        }

        if (this.useUpscaling) {
          await this.runUpscale()
        }
      }
    }

    this.algorithmStatus = ALGORITHM.NONE
    this.frameStatus = undefined
  }

  runNudification() {
    this.algorithmStatus = ALGORITHM.DREAMPOWER

    return new Promise((resolve, reject) => {
      const onSpawnError = (error) => {
        reject(new Warning(
          'Failed to start.',
          'There was a problem trying to start DreamPower, make sure the installation is not corrupt.',
          error,
        ))
      }

      try {
        this.process = power.transform(this.toObject())
      } catch (error) {
        onSpawnError(error)
        return
      }

      this.process.on('error', (error) => {
        // DreamPower could not start.
        onSpawnError(error)
      })

      this.process.on('stdout', (output) => {
        // DreamPower output.
        output.forEach((text) => {
          text = trim(toString(text))

          if (this.photo.file.isAnimated && text.includes('Multiple Image Processing')) {
            const frameDetect = text.match(/^(.*) : ([0-9]*)\/([0-9]*)$/)

            if (frameDetect && frameDetect[2] && frameDetect[3]) {
              this.frameStatus = `${frameDetect[2]}/${frameDetect[3]}`
            }
          }

          this.cli.lines.unshift({
            text,
            css: {},
          })
        })
      })

      this.process.on('stderr', (output) => {
        const text = toString(output)

        // DreamPower errors.
        this.cli.lines.unshift({
          text,
          css: {
            'text-danger': true,
          },
        })

        this.cli.error += `${text}\n`
      })

      this.process.on('success', async () => {
        if (!this.isMaskGeneration) {
          await this.outputFile.load()

          if (!this.outputFile.exists) {
            reject(
              new Warning(
                'Nudification failed!',
                'The photo has been nudified but could not be saved. Please make sure you have enough disk space and that DreamTime can write to it.',
              ),
            )
          }
        }

        window.consola.track('DREAM_COMPLETED')
        resolve(true)
      })

      this.process.on('fail', () => {
        reject(this.getPowerError())
      })

      this.process.on('cancelled', () => {
        resolve(false)
      })
    })
  }

  runUpscale() {
    this.algorithmStatus = ALGORITHM.WAIFU2X

    return new Promise((resolve, reject) => {
      const onSpawnError = (error) => {
        reject(new Warning(
          'Waifu2X failed to start.',
          'A serious problem has occurred while trying to start Waifu2X.',
          error,
        ))
      }

      let input
      let output

      if (this.mask === STEP.SCALE) {
        input = this.photo.fileToUpscale.path
        output = this.photo.masks.scale.file.path
      } else {
        input = this.outputFile.path
        output = this.outputFile.path
      }

      try {
        this.process = waifu.transform(this.preferences, input, output)
      } catch (error) {
        onSpawnError(error)
        return
      }

      this.process.on('error', (error) => {
        // Failed to start.
        onSpawnError(error)
      })

      this.process.on('stdout', (outputMessage) => {
        // Output.
        outputMessage.forEach((text) => {
          text = toString(text)

          this.cli.lines.unshift({
            text,
            css: {},
          })
        })
      })

      this.process.on('stderr', (outputMessage) => {
        const text = toString(outputMessage)

        // Errors.
        this.cli.lines.unshift({
          text,
          css: {
            'text-danger': true,
          },
        })

        this.cli.error += `${text}\n`
      })

      this.process.on('success', async () => {
        window.consola.track('DREAM_UPSCALED')
        resolve()
      })

      this.process.on('fail', () => {
        reject(this.getPowerError())
      })

      this.process.on('cancelled', () => {
        resolve()
      })
    })
  }

  async runColorPaddingRemoval() {
    let input
    let output

    if (this.mask === STEP.PADDING) {
      input = this.photo.masks.nude.file
      output = this.photo.masks.padding.file
    } else {
      input = this.outputFile
      output = this.outputFile
    }

    this.algorithmStatus = ALGORITHM.DREAMTIME

    const image = new ImageMagick(input)

    await image.crop(this.photo.geometry.crop)

    await image.resize(512, 512)

    await image.write(output)
  }

  /**
   *
   */
  stop() {
    if (isNil(this.process)) {
      return
    }

    this.process.emit('cancel')
  }

  /**
   *
   */
  onQueue() {
    this.cli = {
      lines: [],
      error: '',
    }

    this.failed = false

    this.status = 'pending'
  }

  /**
   *
   */
  onStart() {
    this.setupPreferences()

    this.timer.start()

    this.status = 'running'
  }

  /**
   *
   */
  onFinish() {
    this.timer.stop()

    this.status = 'finished'

    this.sendNotification()
    achievements.probability()
  }

  /**
   *
   */
  onFail() {
    this.failed = true

    this.timer.stop()

    this.status = 'finished'
  }

  /**
   * @return {Error}
   */
  getPowerError() {
    const errorMessage = this.cli.error

    if (isEmpty(errorMessage)) {
      return null
    }

    if (Swal.isVisible()) {
      // There is already an modal opened,
      // avoid spamming the user.
      return null
    }

    const terminalText = this.cli.lines.map((item) => item.text)

    this.photo.consola.warn(terminalText.join('\n'))

    const title = 'Unknown error!'

    const extra = {
      terminal: terminalText,
    }

    for (const payload of cliErrors) {
      if (errorMessage.toLowerCase().includes(payload.query.toLowerCase())) {
        return new Warning(payload.title || title, payload.message, new Error(errorMessage), extra)
      }
    }

    return new Exception(title, 'The algorithm has been interrupted by an unknown problem. Please visit our <a href="https://chat.dreamnet.tech" target="_blank">chat</a> for support, we may ask you for the photo/video and the text below to fix the problem.', new Error(errorMessage), extra)
  }

  /**
   *
   */
  sendNotification() {
    if (!settings.notifications.run || this.isMaskGeneration) {
      return
    }

    try {
      const browserWindow = getCurrentWindow()

      if (isNil(browserWindow) || !browserWindow.isMinimized()) {
        return
      }

      const notification = new Notification(`📷 Run ${this.id} has finished.`, {
        icon: this.outputFile.path,
        body: 'Hopefully it was a good run.',
      })

      notification.onclick = () => {
        browserWindow.focus()
        window.$redirect(`/nudify/${this.photo.id}/results`)
      }
    } catch (error) {
      this.photo.consola.warn('Unable to send a notification.', error).report()
    }
  }
}
