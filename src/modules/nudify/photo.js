// DreamTime.
// Copyright (C) DreamNet. All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License 3.0 as published by
// the Free Software Foundation. See <https://www.gnu.org/licenses/gpl-3.0.html>
//
// Written by Ivan Bravo Bravo <ivan@dreamnet.tech>, 2019.

import {
  cloneDeep, isNil, merge, isError, random,
} from 'lodash'
import path from 'path'
import { Queue } from '@dreamnet/queue'
import EventBus from 'js-event-bus'
import randomcolor from 'randomcolor'
import Avatars from '@dicebear/avatars'
import sprites from '@dicebear/avatars-bottts-sprites'
import { uniqueNamesGenerator, names } from 'unique-names-generator'
import { settings, PMODE } from '../system/settings'
import { Consola, handleError } from '../consola'
import { NudifyQueue } from './queue'
import { Nudify } from './nudify'
import { PhotoRun } from './photo-run'
import { PhotoMask, STEP } from './photo-mask'
import { File } from '../file'
import { Timer } from '../timer'
import { events } from '../events'

const { getCurrentWindow } = require('electron').remote

const { getModelsPath, getTempPath } = $provider.paths
const { fs } = $provider
const { shell, dialog } = $provider.api

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
*/

export class Photo {
  /**
   * @type {string}
   */
  id

  avatar = {
    name: 'Amanari',
    color: '#000',
    image: '',
  }

  /**
   * @type {File}
   */
  file

  /**
   * @type {PhotoFiles}
   */
  files = {
    editor: null,
    crop: null,
  }

  /**
   * @type {PhotoMasks}
   */
  masks = {
    correct: null, // 0 = dress -> correct
    mask: null, // 1 = correct -> mask
    maskref: null, // 2 = mask -> maskref
    maskdet: null, // 3 = maskref -> maskdet
    maskfin: null, // 4 = maskdet -> maskfin
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
   * @type {Object}
   * @property {number} startX
   * @property {number} startY
   * @property {number} endX
   * @property {number} endY
   */
  overlay

  /**
   * @type {Consola}
   */
  consola

  get mode() {
    return this.preferences.mode
  }

  get folderName() {
    // TODO: Implement models
    return 'Uncategorized'
  }

  get running() {
    return this.status === 'running'
  }

  get finished() {
    return this.status === 'finished'
  }

  get pending() {
    return this.status === 'pending'
  }

  get waiting() {
    return this.status === 'waiting'
  }

  get started() {
    return this.running || this.finished
  }

  get runsCount() {
    return this.preferences.mode === PMODE.ADVANCED ? 1 : this.preferences.body.executions
  }

  get canModify() {
    return this.file.mimetype !== 'image/gif'
  }

  get canShowEditor() {
    return this.canModify && this.preferences.mode >= PMODE.NORMAL
  }

  get canShowCropTool() {
    return this.canModify && this.preferences.mode >= PMODE.SIMPLE && this.preferences.advanced.scaleMode === 'cropjs'
  }

  get canShowOverlayTool() {
    return this.canModify && this.preferences.mode >= PMODE.SIMPLE && this.preferences.advanced.scaleMode === 'overlay'
  }

  get isCustomMasks() {
    return this.preferences.mode === PMODE.ADVANCED
  }

  get isCustomMasksValid() {
    return this.masks.correct.exists
      && this.masks.mask.exists
      && this.masks.maskref.exists
      && this.masks.maskdet.exists
      && this.masks.maskfin.exists
  }

  get isScaleModeCorrected() {
    const { scaleMode } = this.preferences.advanced
    return scaleMode !== this.scaleMode
  }

  get scaleMode() {
    const { mode } = this.preferences
    const { scaleMode } = this.preferences.advanced

    if (mode === PMODE.MINIMAL) {
      return 'auto-rescale'
    }

    if (scaleMode === 'cropjs') {
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

      if (isNil(this.overlay)) {
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
    if (this.scaleMode === 'cropjs') {
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
   * @param {File} file
   * @param {*} [model]
   */
  // eslint-disable-next-line no-unused-vars
  constructor(file, { model = null } = {}) {
    if (settings.app.duplicates) {
      const now = Date.now() + random(1, 100)
      this.id = `${file.md5}-${now}`
    } else {
      this.id = file.md5
    }

    this.file = file

    fs.ensureDirSync(getTempPath(this.id))

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
    }

    this.consola = Consola.create(file.fullname)

    this.setup()
  }

  /**
   *
   * @returns {File}
   */
  createFile(name) {
    return new File(getTempPath(this.id, `${name}.${this.file.extension}`), true)
  }

  /**
   *
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

    this.consola.debug('Saved editor changes.')
  }

  /**
   *
   */
  async syncCrop() {
    if (isNil(this.cropper)) {
      return
    }

    const canvas = this.cropper.getCroppedCanvas({
      width: 512,
      height: 512,
      minWidth: 512,
      minHeight: 512,
      maxWidth: 512,
      maxHeight: 512,
      fillColor: 'white',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    })

    if (!canvas) {
      throw new Warning('The cropper has failed.', 'There was a problem executing the cropper, please open the tool and try again.')
    }

    const dataURL = canvas.toDataURL(this.files.crop.mimetype, 1)
    await this.files.crop.writeDataURL(dataURL)

    this.consola.debug('Saved crop changes.')
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
  setup() {
    this.validate()

    this.setupAvatar()

    this.setupPreferences()

    this.setupQueue()
  }

  /**
   *
   */
  validate() {
    // eslint-disable-next-line no-shadow
    const { exists, mimetype, path } = this.file

    if (!exists) {
      throw new Warning('Upload failed.', `The file "${path}" does not exists.`)
    }

    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png' && mimetype !== 'image/gif') {
      throw new Warning('Upload failed.', `The file "${path}" is not a valid photo. Only jpeg, png or gif.`)
    }
  }

  /**
   *
   *
   */
  setupAvatar() {
    this.avatar.name = uniqueNamesGenerator({ dictionaries: [names], length: 1 })

    this.avatar.color = randomcolor()

    const avatars = new Avatars(sprites, {
      base64: true,
      radius: 100,
      background: this.avatar.color,
    })

    this.avatar.image = avatars.create()
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
        },
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
   *
   */
  saveAll() {
    const dir = dialog.showOpenDialogSync({
      // defaultPath: this.getFolderPath(),
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
    NudifyQueue.cancel(this)
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
    const { transformMode, useColorTransfer } = this.preferences.advanced
    const { randomize, progressive } = this.preferences.body

    consola.track('DREAM_START', { mode })

    if (transformMode === 'export-maskfin') {
      consola.track('DREAM_EXPORT_MASKFIN')
    }

    if (transformMode === 'import-maskfin') {
      consola.track('DREAM_IMPORT_MASKFIN')
    }

    if (useColorTransfer) {
      consola.track('DREAM_COLOR_TRANSFER')
    }

    if (randomize) {
      consola.track('DREAM_RANDOMIZE')
    }

    if (progressive.enabled) {
      consola.track('DREAM_PROGRESSIVE')
    }
  }

  /**
   * Nudification start.
   * This should only be called from the [NudifyQueue].
   */
  async start() {
    if (this.runsCount === 0) {
      return
    }

    await this.syncEditor()
    await this.syncCrop()

    if (this.isCustomMasks && !this.isCustomMasksValid) {
      await this.generateCustomMasks()
      return
    }

    await this.generateNudes()
  }

  /**
   *
   *
   */
  async generateCustomMasks() {
    const run = new PhotoRun(it, this, true)

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
