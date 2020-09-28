// DreamTime.
// Copyright (C) DreamNet. All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License 3.0 as published by
// the Free Software Foundation. See <https://www.gnu.org/licenses/gpl-3.0.html>
//
// Written by Ivan Bravo Bravo <ivan@dreamnet.tech>, 2019.

import fs from 'fs-extra'
import {
  cloneDeep, isNil, isEmpty, isPlainObject, get, set, merge, omit,
} from 'lodash'
import { AppError } from './app-error'
import { paths, system } from './tools'

const logger = require('@dreamnet/logplease').create('settings')

/**
 * User settings.
 */
class Settings {
  /**
   * the payload.
   * a proxy will be used to get or set this information.
   *
   * @type {Object}
   */
  payload = {}

  /**
   * @type {Object}
   */
  _default = {}

  /**
   *
   *
   */
  isSaving = false

  /**
   * file where to save the payload.
   *
   * @type {string}
   */
  get path() {
    if (process.env.BUILD_PORTABLE) {
      return paths.getAppPath('AppData', 'settings.json')
    }

    return paths.getPath('userData', 'settings.json')
  }

  /**
   * Load the settings.
   */
  async load() {
    if (isNil(this.path)) {
      return
    }

    try {
      this.payload = fs.readJsonSync(this.path)
      logger.debug('Settings loaded!')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  /**
   * Save the settings file.
   * This function is called automatically.
   */
  async save() {
    if (this.isSaving) {
      return
    }

    try {
      this.isSaving = true
      fs.writeJsonSync(this.path, this.payload, { spaces: 2 })
      logger.debug('Settings saved!')
    } catch (error) {
      logger.warn('An error occurred while saving the settings.', error)
    } finally {
      this.isSaving = false
    }
  }

  /**
   * @param {string} path
   */
  get(path = '') {
    if (isEmpty(path)) {
      return this.payload
    }

    return get(this.payload, path)
  }

  /**
   * @param {string} path
   * @param {any} payload
   */
  set(path, payload) {
    if (isPlainObject(path)) {
      this.payload = path
    } else {
      this.payload = set(this.payload, path, payload)
    }
  }

  /**
   *
   */
  async boot() {
    this._loadDefault()
    await this.load()
  }

  /**
   * Setup service
   */
  async setup() {
    await this._create()
    await this._upgrade()
  }

  /**
   * Load the default configuration (and the current version)
   */
  _loadDefault() {
    const { v4: uuid } = require('uuid')
    const hasGPU = process.platform === 'darwin' ? false : system.graphics.length > 0

    this.payload = {
      version: 12,
      user: uuid(),

      wizard: {
        welcome: false,
        tos: false,
        user: false,
        telemetry: false,
        waifu: false,
      },

      achievements: {
        badtime: false,
      },

      app: {
        disableHardwareAcceleration: false,
        uploadMode: 'none',
        queuePosition: 'right',
        duplicates: false,
        showAds: true,
        showTips: true,
        window: {
          width: 1200,
          height: 700,
          maximized: true,
        },
      },

      notifications: {
        run: false,
        allRuns: true,
        update: true,
      },

      folders: {
        cropped: paths.getPath('temp'),
        models: paths.getPath('userData', 'Pictures'),
        cli: paths.getPath('userData', 'dreampower'),
        waifu: paths.getPath('userData', 'waifu2x'),
      },

      telemetry: {
        bugs: true,
        dom: true,
      },

      processing: {
        gpus: [0],
        cores: 1,
      },

      preferences: {
        body: {
          runs: {
            mode: false,
            count: 1,
            rate: 0.1,
          },

          boobs: {
            size: 1,
            randomize: {
              enabled: true,
              min: 0.3,
              max: 2,
            },
            progressive: true,
          },
          areola: {
            size: 1,
            randomize: {
              enabled: true,
              min: 0.3,
              max: 2,
            },
            progressive: true,
          },
          nipple: {
            size: 1,
            randomize: {
              enabled: true,
              min: 0.3,
              max: 2,
            },
            progressive: true,
          },
          vagina: {
            size: 0.75,
            randomize: {
              enabled: true,
              min: 0.3,
              max: 1.5,
            },
            progressive: true,
          },
          pubicHair: {
            size: 1,
            randomize: {
              enabled: true,
              min: 0,
              max: 2,
            },
            progressive: true,
          },
        },

        advanced: {
          device: hasGPU ? 'GPU' : 'CPU',
          scaleMode: 'cropjs',
          useColorTransfer: false,
          useColorPaddingStrip: true,
          compress: 0,
          imageSize: 512,
          waifu: {
            enabled: false,
            scale: 2,
            denoise: 1,
            tta: 0,
            arch: 0,
          },
        },

        mode: 2,
      },
    }

    this._default = cloneDeep(this.payload)
  }

  /**
   * Create the settings file if it does not exist.
   */
  async _create() {
    if (fs.existsSync(this.path)) {
      return
    }

    // default settings now with the system information.
    this._loadDefault()

    try {
      fs.outputFileSync(this.path, JSON.stringify(this._default, null, 2))
    } catch (error) {
      throw new AppError(
        `Could not create settings file. Please make sure the program has the necessary permissions to write to:\n${this.path}`,
        { fatal: true, error },
      )
    }
  }

  /**
   * Upgrade the settings file.
   */
  async _upgrade() {
    if (this.payload?.version === this._default.version) {
      return
    }

    logger.debug(`Upgrading settings file to v${this._default.version}`)

    const currentSettings = cloneDeep(this.payload)

    // 1 -> 2
    if (this.payload?.version === 1 && this._default.version >= 2) {
      this.payload.version = 2
      this.payload.preferences = this._default.preferences
      this.payload.notifications = this._default.notifications

      const {
        boobsSize,
        areolaSize,
        nippleSize,
        vaginaSize,
        pubicHairSize,
      } = this.payload.preferences

      this.payload.preferences.boobs.size = boobsSize
      this.payload.preferences.areola.size = areolaSize
      this.payload.preferences.nipple.size = nippleSize
      this.payload.preferences.vagina.size = vaginaSize
      this.payload.preferences.pubicHair.size = pubicHairSize
    }

    // 2 -> 3
    if (this.payload?.version === 2 && this._default.version >= 3) {
      const { processing, preferences } = currentSettings

      this.payload.version = 3

      this.payload.processing = {
        ...processing,
        cores: 4,
        disablePersistentGan: false,
      }

      this.payload.preferences = {
        body: {
          executions: preferences.executions,
          randomize: preferences.randomizePreferences,

          progressive: {
            enabled: preferences.progressivePreferences,
            rate: 0.1,
          },

          boobs: preferences.boobs,
          areola: preferences.areola,
          nipple: preferences.nipple,
          vagina: preferences.vagina,
          pubicHair: preferences.pubicHair,
        },

        advanced: {
          scaleMode: 'auto-rescale',
          useColorTransfer: false,
          useWaifu: false,
        },
      }
    }

    // 3 -> 4
    if (this.payload?.version === 3 && this._default.version >= 4) {
      this.payload.version = 4
      this.payload.app = {
        disableHardwareAcceleration: false,
        uploadMode: 'add-queue',
      }
    }

    // 4 -> 5
    if (this.payload?.version === 4 && this._default.version >= 5) {
      this.payload.version = 5
      // this.payload.preferences.advanced.transformMode = 'normal'
    }

    // 5 -> 6
    if (this.payload?.version === 5 && this._default.version >= 6) {
      this.payload.version = 6

      delete this.payload.welcome

      this.payload.wizard = {
        welcome: false,
        tos: false,
        user: false,
        telemetry: false,
      }

      this.payload.telemetry = {
        bugs: true,
        dom: true,
      }

      this.payload.achievements = {
        badtime: false,
      }

      const { body } = this.payload.preferences

      body.boobs.randomize = {
        enabled: true,
        min: 0.3,
        max: 2,
      }

      body.areola.randomize = {
        enabled: true,
        min: 0.3,
        max: 2,
      }

      body.nipple.randomize = {
        enabled: true,
        min: 0.3,
        max: 2,
      }

      body.vagina.randomize = {
        enabled: true,
        min: 0.3,
        max: 1.5,
      }

      body.pubicHair.randomize = {
        enabled: true,
        min: 0,
        max: 2,
      }
    }

    // 6 -> 7
    if (this.payload?.version === 6 && this._default.version >= 7) {
      this.payload.version = 7
      this.payload.app.queuePosition = 'right'
    }

    // 7 -> 8
    if (this.payload?.version === 7 && this._default.version >= 8) {
      this.payload = merge(this.payload, {
        version: 8,
        wizard: {
          waifu: false,
        },
        processing: {
          cores: 1,
        },
        app: {
          duplicates: false,
          showAds: true,
          showTips: true,
        },
        folders: {
          waifu: paths.getPath('userData', 'waifu2x'),
        },
        preferences: {
          advanced: {
            useColorPaddingStrip: true,
            waifu: {
              enabled: false,
              scale: 2,
              denoise: 1,
              tta: 0,
              arch: 0,
            },
          },
          mode: 2,
        },
      })

      // This throws on some Windows 10 systems.
      try {
        delete this.payload.advanced.useWaifu
        delete this.payload.folders.masks
      } catch (err) {
        logger.warn(err)
      }
    }

    // 8 -> 9
    if (this.payload?.version === 8 && this._default.version >= 9) {
      this.payload = merge(this.payload, {
        version: 9,
        preferences: {
          advanced: {
            device: this.payload.processing.device,
            compress: 0,
            imageSize: 512,
          },
        },
      })

      // This throws on some Windows 10 systems.
      try {
        delete this.payload.processing.device
      } catch (err) {
        logger.warn(err)
      }
    }

    // 9 -> 10
    if (this.payload?.version === 9 && this._default.version >= 10) {
      this.payload = merge(this.payload, {
        version: 10,
        app: {
          window: {
            width: 1200,
            height: 700,
          },
        },
      })
    }

    // 10 -> 11
    if (this.payload?.version === 10 && this._default.version >= 11) {
      this.payload = merge(this.payload, {
        version: 11,
        app: {
          window: {
            maximized: true,
          },
        },
      })

      try {
        delete this.payload.processing.usePython
      } catch (err) {
        logger.warn(err)
      }
    }

    // 11 -> 12
    if (this.payload?.version === 11 && this._default.version >= 12) {
      this.payload = merge(this.payload, {
        version: 12,
        preferences: {
          body: {
            runs: {
              mode: false,
              count: 2,
              rate: 0.1,
            },
          },
        },
      })

      this.payload = omit(this.payload, [
        'preferences.body.executions',
        'preferences.body.randomize',
        'preferences.body.progressive',
      ])
    }

    this.save()
  }
}

export const theSettings = new Settings()

const saveHandler = {
  get(target, property, receiver) {
    try {
      return new Proxy(target[property], saveHandler)
    } catch (err) {
      return Reflect.get(target, property, receiver)
    }
  },
  set(target, property, value, receiver) {
    const response = Reflect.set(target, property, value, receiver)
    theSettings.save()
    return response
  },
  defineProperty(target, property, descriptor) {
    const response = Reflect.defineProperty(target, property, descriptor)
    theSettings.save()
    return response
  },
}

const handler = {
  get(target, property, receiver) {
    try {
      if (property in target) {
        return target[property]
      }

      if (property in target.payload) {
        return new Proxy(target.payload[property], saveHandler)
      }
      // eslint-disable-next-line no-empty
    } catch (err) { }

    if (property in target.payload) {
      return target.payload[property]
    }

    return Reflect.get(target, property, receiver)
  },
}

export const settings = new Proxy(theSettings, handler)
