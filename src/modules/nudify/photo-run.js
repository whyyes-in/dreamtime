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
  trim, kebabCase, truncate, deburr,
} from 'lodash'
import deferred from 'deferred'
import Swal from 'sweetalert2/dist/sweetalert2'
import emojiStrip from 'emoji-strip'
import { File } from '../file'
import { Timer } from '../timer'
import cliErrors from '../config/cli-errors.json'
import preferencesConfig from '../config/preferences.json'
import { achievements } from '../system'
import { settings, PMODE } from '../system/settings'

const { getCurrentWindow } = require('electron').remote

const { transform } = $provider.power
const { getMasksPath, getTempPath } = $provider.paths

export class PhotoRun {
  /**
   * @type {string}
   */
  id

  /**
   * @type {Photo}
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
   * Indicates if this run is used to generate the custom masks.
   * @type {boolean}
   */
  isMasksGeneration = false

  /**
   * @type {string}
   */
  status = 'pending'

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

  get outputName() {
    const now = Date.now() + random(1, 100)
    const { file } = this.photo

    let name = deburr(file.name)
    name = emojiStrip(name)
    name = name.replace(/[^\x00-\x7F]/g, '')
    name = kebabCase(trim(name))
    name = truncate(name, { length: 20, omission: '' })

    return `${name}-RUN${this.id}-${now}-dreamtime.${file.extension}`
  }

  constructor(id, photo, isMasksGeneration = false) {
    this.id = id
    this.photo = photo

    this.isMasksGeneration = isMasksGeneration

    // Output
    this.outputFile = new File(photo.getFolderPath(this.outputName))

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
        overlay: this.photo.overlay,
        masksPath: getTempPath(this.photo.id),
      },
      preferences: this.preferences,
      outputFile: this.outputFile,
      isMasksGeneration: this.isMasksGeneration,
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
      this.preferences = {
        ...this.preferences,
        body: {
          executions: 1,
          randomize: false,
          progressive: {
            enabled: false,
          },
        },
        advanced: {
          useColorTransfer: false,
          useWaifu: false,
        },
      }
    }

    if (mode !== PMODE.ADVANCED) {
      // Body randomize/progresive.
      const { body } = this.preferences

      if (body.randomize) {
        // randomize.
        forIn(preferencesConfig, (payload, key) => {
          const { enabled, min, max } = body[key].randomize

          if (enabled) {
            body[key].size = random(min, max, true)
          }
        })
      } else if (body.progressive.enabled) {
        // progressive.
        const add = body.progressive.rate * (this.id - 1)

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
  start() {
    const def = deferred()

    const onSpawnError = (error) => {
      def.reject(new Warning('Failed to start.', 'There was a problem trying to start DreamPower, make sure the installation is not corrupt.', error))
    }

    try {
      this.process = transform(this.toObject())
    } catch (error) {
      onSpawnError(error)
      return def.promise
    }

    this.process.on('error', (error) => {
      // DreamPower could not start.
      onSpawnError(error)
    })

    this.process.on('stdout', (output) => {
      // DreamPower output.
      output.forEach((text) => {
        text = toString(text)

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
      await Promise.all([
        this.outputFile.open(),
        this.maskfinFile.open(),
      ])

      window.consola.track('DREAM_COMPLETED')

      def.resolve()
    })

    this.process.on('fail', (fileError) => {
      if (fileError) {
        def.reject(
          new Warning(
            'Nudification failed!',
            'The photo has been transformed but could not be saved. Please make sure you have enough disk space and that DreamTime can write to it.',
            fileError,
          ),
        )
      } else {
        def.reject(this.getPowerError())
      }
    })

    this.process.on('cancelled', () => {
      def.resolve()
    })

    return def.promise
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

    const title = 'Nudification failed!'

    const extra = {
      terminal: this.cli.lines.map((item) => item.text),
    }

    for (const payload of cliErrors) {
      if (errorMessage.toLowerCase().includes(payload.query.toLowerCase())) {
        return new Warning(title, payload.message, new Error(errorMessage), extra)
      }
    }

    return new Exception(title, 'The algorithm has been interrupted by an unknown problem.', new Error(errorMessage), extra)
  }

  /**
   *
   */
  sendNotification() {
    if (!settings.notifications.run) {
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
