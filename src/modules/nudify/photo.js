// DreamTime.
// Copyright (C) DreamNet. All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License 3.0 as published by
// the Free Software Foundation. See <https://www.gnu.org/licenses/gpl-3.0.html>
//
// Written by Ivan Bravo Bravo <ivan@dreamnet.tech>, 2019.

import {
  cloneDeep, isNil, merge, isError, random, round,
} from 'lodash'
import path from 'path'
import { Queue } from '@dreamnet/queue'
import EventBus from 'js-event-bus'
import randomcolor from 'randomcolor'
import { uniqueNamesGenerator, names } from 'unique-names-generator'
import { ImageMagick } from '../imagemagick'
import { settings, PMODE } from '../system/settings'
import { requirements } from '../system'
import { Consola, handleError } from '../consola'
import { NudifyQueue } from './queue'
import { Nudify } from './nudify'
import { PhotoRun } from './photo-run'
import { PhotoMask, STEP } from './photo-mask'
import { File } from '../file'
import { Timer } from '../timer'
import { events } from '../events'
import { closestNumber } from '../helpers'

const { getCurrentWindow } = require('electron').remote

const { getModelsPath, getTempPath } = $provider.paths
const { fs } = $provider
const { dialog } = $provider.api

/**
 * @typedef {object} PhotoFiles
 * @property {File} PhotoFiles.editor
 * @property {File} PhotoFiles.crop
*/

/**
 * @typedef {object} PhotoMasks
 * @property {PhotoMask} PhotoMask.correct
 * @property {PhotoMask} PhotoMask.mask
 * @property {PhotoMask} PhotoMask.maskref
 * @property {PhotoMask} PhotoMask.maskdet
 * @property {PhotoMask} PhotoMask.maskfin
 * @property {PhotoMask} PhotoMask.nude
 * @property {PhotoMask} PhotoMask.overlay
 * @property {PhotoMask} PhotoMask.padding
 * @property {PhotoMask} PhotoMask.scale
*/

export class Photo {
  /**
   * @type {string}
   */
  id

  /**
   * Visual identification.
   * With this we can identify duplicate photos.
   */
  avatar = {
    name: 'Amanari',
    color: '#000',
  }

  /**
   * @type {number}
   */
  time

  /**
   * Original photo.
   * @type {File}
   */
  file

  /**
   * Additional photos.
   * @type {PhotoFiles}
   */
  files = {
    editor: null,
    crop: null,
  }

  get fileToUpscale() {
    if (this.scaleMode === 'overlay') {
      return this.masks.overlay.file
    } if (this.useColorPaddingRemoval) {
      return this.masks.padding.file
    }

    return this.masks.nude.file
  }

  /**
   * Masks.
   * @type {PhotoMasks}
   */
  masks = {
    correct: null, // 0 = dress -> correct
    mask: null, // 1 = correct -> mask
    maskref: null, // 2 = mask -> maskref
    maskdet: null, // 3 = maskref -> maskdet
    maskfin: null, // 4 = maskdet -> maskfin
    nude: null, // 5 = maskfin -> nude
    overlay: null, // Image to overlay
    padding: null, // Color padding removal
    scale: null, // Waifu2X
  }

  /**
   * @type {EventBus}
   */
  events = new EventBus()

  /**
   * @type {string}
   */
  model

  /**
   * @type {string}
   */
  _status = 'pending'

  get status() {
    return this._status
  }

  set status(value) {
    this._status = value
    events.emit('nudify.update')
  }

  /**
   * @type {Queue}
   */
  queue

  /**
   * @type {Array}
   */
  runs = []

  /**
   * @type {Object}
   */
  preferences = {}

  /**
   * @type {Timer}
   */
  timer = new Timer()

  /**
   * @type {import('cropperjs').default}
   */
  cropper

  /**
   * @type {import('tui-image-editor')}
   */
  editor

  /**
   * @typedef {object} CropBoxData
   * @property {number} CropBoxData.left
   * @property {number} CropBoxData.top
   * @property {number} CropBoxData.width
   * @property {number} CropBoxData.height
  */
  /**
   * @typedef {object} CropData
   * @property {number} CropData.x
   * @property {number} CropData.y
   * @property {number} CropData.width
   * @property {number} CropData.height
  */
  /**
   * @typedef {object} ImageData
   * @property {number} ImageData.left
   * @property {number} ImageData.top
   * @property {number} ImageData.width
   * @property {number} ImageData.height
   * @property {number} ImageData.naturalWidth
   * @property {number} ImageData.naturalHeight
  */
  /**
   * @typedef {object} Geometry
   * @property {CropBoxData} Geometry.cropBox
   * @property {CropData} Geometry.crop
   * @property {ImageData} Geometry.image
  */
  /**
   *
   * @type {Geometry}
   */
  geometry = {
    cropBox: null,
    crop: null,
    image: null,
    get overlay() {
      if (!this.crop) {
        return null
      }

      return {
        startX: round(this.crop.x),
        startY: round(this.crop.y),
        endX: round(this.crop.x) + round(this.crop.width),
        endY: round(this.crop.y) + round(this.crop.height),
      }
    },
  }

  /**
   * @type {Consola}
   */
  consola

  /**
   * Mode.
   * Complexity of options for the photo.
   *
   * @readonly
   */
  get mode() {
    return this.preferences.mode
  }

  /**
   *
   * @type {string}
   * @readonly
   */
  get folderName() {
    // TODO: Implement models
    return 'Uncategorized'
  }

  /**
   *
   * @type {boolean}
   * @readonly
   */
  get running() {
    return this.status === 'running'
  }

  /**
   *
   * @type {boolean}
   * @readonly
   */
  get finished() {
    return this.status === 'finished'
  }

  /**
   *
   * @type {boolean}
   * @readonly
   */
  get pending() {
    return this.status === 'pending'
  }

  /**
   *
   * @type {boolean}
   * @readonly
   */
  get waiting() {
    return this.status === 'waiting'
  }

  /**
   *
   * @type {boolean}
   * @readonly
   */
  get started() {
    return this.running || this.finished
  }

  /**
   * Number of runs to execute.
   *
   * @type {number}
   * @readonly
   */
  get runsCount() {
    if (this.mode === PMODE.ADVANCED) {
      return 1
    }

    if (this.preferences.body.runs.mode !== false) {
      return this.preferences.body.runs.count
    }

    return 1
  }

  /**
   * Indicates if the photo can be modified
   * with the crop/editor/etc tools.
   *
   * @type {boolean}
   * @readonly
   */
  get canModify() {
    return !this.file.isAnimated
  }

  /**
   *
   * @type {boolean}
   * @readonly
   */
  get canShowEditor() {
    return this.canModify && this.mode >= PMODE.NORMAL
  }

  /**
   *
   * @type {boolean}
   * @readonly
   */
  get canShowCropTool() {
    return this.canModify && this.mode >= PMODE.SIMPLE && this.preferences.advanced.scaleMode === 'cropjs'
  }

  /**
   *
   * @type {boolean}
   * @readonly
   */
  get canShowOverlayTool() {
    return this.canModify && this.mode >= PMODE.SIMPLE && this.preferences.advanced.scaleMode === 'overlay'
  }

  /**
   *
   * @type {boolean}
   * @readonly
   */
  get canShowPaddingTool() {
    return this.canModify && this.mode >= PMODE.SIMPLE && this.preferences.advanced.scaleMode === 'padding'
  }

  /**
   *
   * @type {boolean}
   * @readonly
   */
  get withCustomMasks() {
    return this.mode === PMODE.ADVANCED
  }

  /**
   *
   *
   * @readonly
   */
  get useUpscaling() {
    return this.preferences.advanced.waifu.enabled && requirements.canUseWaifu
  }

  /**
   *
   * @type {boolean}
   * @readonly
   */
  get useColorPaddingRemoval() {
    return this.scaleMode === 'padding' && this.preferences.advanced.useColorPaddingStrip
  }

  /**
   * Indicates if the scale mode is different from the one selected by the user.
   *
   * @type {boolean}
   * @readonly
   */
  get isScaleModeCorrected() {
    const { scaleMode } = this.preferences.advanced
    return scaleMode !== this.scaleMode
  }

  get scaleModeName() {
    switch (this.preferences.advanced.scaleMode) {
      case 'overlay':
        return 'Overlay'

      case 'cropjs':
        return 'Crop'

      case 'padding':
        return 'Padding'

      default:
        return 'Automatic'
    }
  }

  get scaleModeURL() {
    switch (this.preferences.advanced.scaleMode) {
      case 'overlay':
        return `/nudify/${this.id}/overlay`

      case 'cropjs':
        return `/nudify/${this.id}/crop`

      case 'padding':
        return `/nudify/${this.id}/padding`

      default:
        return `/nudify/${this.id}`
    }
  }

  /**
   *
   *
   * @type {number}
   * @readonly
   */
  get imageSize() {
    const { imageSize } = this.preferences.advanced
    return closestNumber(imageSize)
  }

  /**
   * Returns the final scale mode after validations.
   *
   * @type {string}
   * @readonly
   */
  get scaleMode() {
    const { mode } = this.preferences
    const { scaleMode } = this.preferences.advanced

    if (mode === PMODE.MINIMAL) {
      return 'auto-rescale'
    }

    if (scaleMode === 'cropjs' || scaleMode === 'padding') {
      if (!this.canModify) {
        return 'auto-rescale'
      }

      if (!this.files.crop.exists) {
        // Crop tool has not been used.
        return 'auto-rescale'
      }
    }

    if (scaleMode === 'overlay') {
      if (!this.canModify) {
        return 'auto-rescale'
      }

      if (isNil(this.geometry.overlay)) {
        // Overlay tool has not been used.
        return 'auto-rescale'
      }
    }

    return scaleMode
  }

  /**
   * Final file to process.
   *
   * @type {File}
   */
  get finalFile() {
    if (this.scaleMode === 'cropjs' || this.scaleMode === 'padding') {
      return this.files.crop
    }

    if (this.files.editor.exists && this.canModify) {
      return this.files.editor
    }

    return this.file
  }

  /**
   * File for the crop tool.
   *
   * @type {File}
   */
  get inputFile() {
    if (this.files.editor.exists) {
      return this.files.editor
    }

    return this.file
  }

  /**
   *
   *
   * @readonly
   */
  get previewFile() {
    let file = this.inputFile

    if (this.finished && this.runs.length > 0) {
      const [run] = this.runs

      if (run.outputFile && run.outputFile.exists) {
        file = run.outputFile
      }
    }

    return file
  }

  /**
   *
   * @param {File} file
   */
  constructor(file) {
    this.time = Date.now() + random(1, 10)

    if (settings.app.duplicates) {
      this.id = `${file.md5}-${this.time}`
    } else {
      this.id = file.md5
    }

    this.file = file

    this.consola = Consola.create(file.fullname)

    this.setup()
  }

  /**
   *
   */
  setup() {
    fs.ensureDirSync(this.getFilesPath())

    this.files = {
      editor: this.createFile('Editor'),
      crop: this.createFile('Crop'),
    }

    this.masks = {
      correct: new PhotoMask(STEP.CORRECT, this),
      mask: new PhotoMask(STEP.MASK, this),
      maskref: new PhotoMask(STEP.MASKREF, this),
      maskdet: new PhotoMask(STEP.MASKDET, this),
      maskfin: new PhotoMask(STEP.MASKFIN, this),
      nude: new PhotoMask(STEP.NUDE, this),
      overlay: new PhotoMask(STEP.OVERLAY, this),
      padding: new PhotoMask(STEP.PADDING, this),
      scale: new PhotoMask(STEP.SCALE, this),
    }

    this.validate()

    this.setupAvatar()

    this.setupPreferences()

    this.setupQueue()
  }

  /**
   *
   * @returns {File}
   */
  createFile(name, options = { deleteIfExists: true }) {
    return new File(this.getFilesPath(`${name}.png`), options)
  }

  /**
   *
   * @param  {...any} args
   */
  getFilesPath(...args) {
    return getTempPath(this.file.md5, this.time.toString(), ...args)
  }

  /**
   *
   * @param  {...any} args
   */
  getFolderPath(...args) {
    return getModelsPath(this.folderName, ...args)
  }

  /**
   *
   */
  validate() {
    this.file.validateAsPhoto()
  }

  /**
   *
   *
   */
  setupAvatar() {
    this.avatar.name = uniqueNamesGenerator({ dictionaries: [names], length: 1 })

    this.avatar.color = randomcolor()
  }

  /**
   *
   *
   */
  setupPreferences() {
    this.preferences = cloneDeep(settings.payload.preferences)

    let forced = {}

    if (!this.canModify) {
      forced = {
        advanced: {
          scaleMode: this.scaleMode,
          waifu: {
            enabled: false,
          },
        },
      }

      if (this.preferences.mode === PMODE.ADVANCED) {
        this.preferences.mode = PMODE.NORMAL
      }
    }

    this.preferences = merge(this.preferences, forced)
  }

  /**
   *
   */
  setupQueue() {
    this.queue = new Queue(this.worker)

    this.queue.on('finished', () => {
      if (this.runs.length === 0) {
        this.status = 'pending'
      } else {
        this.onFinish()
      }

      this.consola.debug('🏁 Runs finished. 🏁')
    })

    this.queue.on('task_added', (run) => {
      run.onQueue()

      this.onQueueRun()

      this.consola.debug(`📷 Run added: #${run.id}`)
    })

    this.queue.on('task_started', (run) => {
      run.onStart()

      this.consola.debug(`🚗 Run started: #${run.id}`)
    })

    this.queue.on('task_finished', (run) => {
      run.onFinish()

      this.consola.debug(`🏁 Run finished: #${run.id}`)
    })

    this.queue.on('task_failed', (run, error) => {
      run.onFail()

      this.consola.warn(`💥 Run failed: #${run.id} ${error}`)

      if (isError(error)) {
        handleError(error)
      }
    })

    this.queue.on('task_dropped', (run) => {
      run.stop()
      run.onFinish()

      this.consola.debug(`⛔ Run dropped: ${run.id}`)
    })
  }

  /**
   * Synchronize and create all necessary files before nudification.
   */
  async sync() {
    await this.syncEditor()

    if (this.preferences.advanced.scaleMode === 'padding') {
      await this.syncColorPadding()
    } else {
      await this.syncCrop()
    }
  }

  /**
   * Create the photo with the editor changes.
   */
  async syncEditor() {
    if (isNil(this.editor)) {
      return
    }

    const dataURL = this.editor.toDataURL({
      format: this.file.extension,
      quality: 1,
      multiplier: 1,
    })

    await this.files.editor.writeDataURL(dataURL)
    await this.files.editor.load()

    this.consola.debug('Saved editor changes.')
  }

  /**
   * Create the cropped photo using ImageMagick.
   */
  async syncImageMagickCrop() {
    if (!this.geometry.crop) {
      return
    }

    const image = new ImageMagick(this.inputFile)

    await image.crop(this.geometry.crop)

    await image.resize(512, 512)

    await image.write(this.files.crop)

    await this.files.crop.load()

    this.consola.debug('Saved crop changes.')
  }

  /**
   * Create the cropped photo using HTMLCanvas.
   * This method can produce poor quality results.
   */
  async syncCrop() {
    if (!this.cropper) {
      return
    }

    const { imageSize } = this

    const canvas = this.cropper.getCroppedCanvas({
      width: imageSize,
      height: imageSize,
      minWidth: imageSize,
      minHeight: imageSize,
      maxWidth: imageSize,
      maxHeight: imageSize,
      fillColor: 'white',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    })

    if (!canvas) {
      throw new Warning('The cropper has failed.', 'There was a problem with the cropper, please open the tool and try again.')
    }

    const dataURL = canvas.toDataURL(this.file.mimetype, 1)

    await this.files.crop.writeDataURL(dataURL)

    await this.files.crop.load()

    this.consola.debug('Saved legacy crop changes.')
  }

  /**
   * Create the photo with the color padding mask.
   */
  async syncColorPadding() {
    if (!this.geometry.image || !this.geometry.crop) {
      return
    }

    const PaddingMask = require('~/assets/images/masks/1.jpg')

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    const mask = new Image()
    const image = new Image()

    const { image: imageData, crop: cropData } = this.geometry

    canvas.width = imageData.naturalWidth
    canvas.height = imageData.naturalHeight

    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'

    await Promise.all([
      new Promise((resolve) => {
        image.onload = () => {
          resolve()
        }

        image.src = this.inputFile.path
      }),
      new Promise((resolve) => {
        mask.onload = () => {
          resolve()
        }

        mask.src = PaddingMask
      }),
    ])

    context.drawImage(mask, 0, 0, canvas.width, canvas.height)
    context.drawImage(image, cropData.x, cropData.y, cropData.width, cropData.height)

    const dataURL = canvas.toDataURL(this.file.mimetype, 1)

    await this.files.crop.writeDataURL(dataURL)
    await this.files.crop.load()
  }

  /**
   * Save the results of all runs.
   */
  saveAll() {
    if (this.withCustomMasks) {
      return
    }

    const dir = dialog.showOpenDialogSync({
      properties: ['openDirectory'],
    })

    if (isNil(dir)) {
      return
    }

    if (!fs.existsSync(dir[0])) {
      return
    }

    this.consola.debug(`Saving all results in ${dir[0]}`)

    this.runs.forEach((photoRun) => {
      const savePath = path.join(dir[0], photoRun.outputName)

      this.consola.debug(savePath)
      photoRun.outputFile.copy(savePath)
    })
  }

  /**
   *
   * @param {*} id
   */
  getRunById(id) {
    return this.runs[id - 1]
  }

  /**
   * Add this photo to the queue (time to nudify)
   */
  add() {
    NudifyQueue.add(this)
  }

  /**
   * Cancel the photo runs and remove it from the queue.
   */
  cancel() {
    if (this.withCustomMasks) {
      // When working with custom masks the photo is not part of the queue
      // Why? Because that's extra work :(
      this.stop()
    } else {
      NudifyQueue.cancel(this)
    }
  }

  /**
   * Remove the photo from the application.
   */
  forget() {
    Nudify.forget(this)
  }

  /**
   *
   */
  track() {
    const { mode } = this.preferences
    const { useColorTransfer } = this.preferences.advanced
    const { mode: runsMode } = this.preferences.body.runs

    consola.track('DREAM_START', { mode })

    if (useColorTransfer) {
      consola.track('DREAM_COLOR_TRANSFER')
    }

    if (runsMode === 'randomize') {
      consola.track('DREAM_RANDOMIZE')
    }

    if (runsMode === 'increase') {
      consola.track('DREAM_PROGRESSIVE')
    }
  }

  /**
   * Nudification start.
   * This should only be called from the [NudifyQueue].
   */
  async start() {
    if (this.withCustomMasks) {
      await this.generateMask(this.nextMask)
    } else {
      await this.generateNudes()
    }
  }

  /**
   *
   *
   * @param {string} mask
   */
  async generateMask(mask) {
    if (mask === STEP.MASK) {
      await this.sync()
    }

    const run = new PhotoRun(1, this, mask)

    this.masks[mask].run = run

    this.runs.push(run)
    this.queue.add(run)

    await new Promise((resolve) => {
      this.queue.once('finished', () => {
        resolve()
      })
    })
  }

  /**
   *
   *
   */
  async generateNudes() {
    if (this.runsCount === 0) {
      return
    }

    await this.sync()

    this.track()

    for (let it = 1; it <= this.runsCount; it += 1) {
      const run = new PhotoRun(it, this)

      this.runs.push(run)
      this.queue.add(run)
    }

    await new Promise((resolve) => {
      this.queue.once('finished', () => {
        consola.track('DREAM_END')
        resolve()
      })
    })
  }

  /**
   * Cancel the photo runs.
   * This should only be called from the queue.
   */
  stop() {
    this.queue.clear()
  }

  /**
   *
   * @param {PhotoRun} run
   */
  addRun(run) {
    this.queue.add(run)
  }

  /**
   *
   * @param {PhotoRun} run
   */
  cancelRun(run) {
    this.queue.drop(run)
  }

  /**
   *
   * @param {PhotoRun} run
   */
  worker(run) {
    return run.start()
  }

  /**
   *
   */
  onQueue() {
    this.runs = []

    this.status = 'waiting'
  }

  /**
   *
   */
  onStart() {
    this.timer.start()

    this.status = 'running'

    this.events.emit('start')
  }

  /**
   *
   */
  onQueueRun() {
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

    this.events.emit('finish')
  }

  /**
   *
   */
  sendNotification() {
    if (!settings.notifications.allRuns) {
      return
    }

    try {
      const browserWindow = getCurrentWindow()

      if (isNil(browserWindow) || !browserWindow.isMinimized()) {
        return
      }

      const notification = new Notification('💖 Dream fulfilled!', {
        icon: this.file.path,
        body: 'All runs have finished.',
      })

      notification.onclick = () => {
        browserWindow.focus()
        window.$redirect(`/nudify/${this.id}/results`)
      }
    } catch (error) {
      this.photo.consola.warn('Unable to send a notification.', error).report()
    }
  }
}
