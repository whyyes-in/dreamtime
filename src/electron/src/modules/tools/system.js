// DreamTime.
// Copyright (C) DreamNet. All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License 3.0 as published by
// the Free Software Foundation. See <https://www.gnu.org/licenses/gpl-3.0.html>
//
// Written by Ivan Bravo Bravo <ivan@dreamnet.tech>, 2019.

import {
  filter, isNil,
} from 'lodash'
import fs from 'fs-extra'
import si from 'systeminformation'
import isOnline from 'is-online'
import { settings } from '../settings'
import { AppError } from '../app-error'
import { getModelsPath, getMasksPath } from './paths'

const logger = require('@dreamnet/logplease').create('system')

class System {
  /**
   * @type {si.Systeminformation.OsData}
   */
  os

  /**
   * @type {si.Systeminformation.GraphicsData}
   */
  _graphics

  /**
   * @type {Array}
   */
  get graphics() {
    if (isNil(this._graphics)) {
      return []
    }

    return filter(this._graphics.controllers, { vendor: 'NVIDIA' })
  }

  /**
   * @type {si.Systeminformation.CpuData}
   */
  cpu

  /**
   * @type {si.Systeminformation.MemData}
   */
  memory

  /**
   * @type {Object}
   */
  snapshot = {
    load: null,
    cpu: {
      speed: null,
      temperature: null,
    },
    memory: null,
    online: false,
  }

  /**
   * @type {boolean}
   */
  online

  /**
   *
   *
   * @readonly
   */
  get hasToCollect() {
    return !fs.existsSync(settings.path)
  }

  /**
   *
   */
  async setup() {
    await this.collect()

    /*
    if (this.hasToCollect) {
      await this.collect()
    } else {
      this.collect()
    }
    */

    this.createRequiredFolders()
  }

  /**
   *
   *
   */
  async collect() {
    logger.debug('Collecting system information...')

    const [
      graphics,
      os,
      cpu,
      memory,
      online,
    ] = await Promise.all([
      si.graphics(),
      si.osInfo(),
      si.cpu(),
      si.mem(),
      isOnline(),
    ])

    this._graphics = graphics
    this.os = os
    this.cpu = cpu
    this.memory = memory
    this.online = online

    logger.info('GPU:', this.graphics)
    logger.info(`RAM: ${memory.total} bytes.`)
    logger.info(`Online: ${online}`)
  }

  /**
   *
   */
  async takeSnapshot(requirements = {}) {
    logger.info('Taking snapshot...')

    const [load, cpuSpeed, cpuTemperature, memory] = await Promise.all([
      si.currentLoad(),
      si.cpuCurrentspeed(),
      si.cpuTemperature(),
      si.mem(),
    ])

    this.snapshot = {
      load,
      cpu: {
        speed: cpuSpeed,
        temperature: cpuTemperature,
      },
      memory,
      settings: settings.payload,
      requirements,
    }

    // logger.info('Current load:', load)
    // logger.info('CPU Speed:', cpuSpeed)
    // logger.info('CPU Temperature:', cpuTemperature)
    // logger.info('Memory:', memory)

    return this.snapshot
  }

  /**
   *
   *
   */
  async createRequiredFolders() {
    const dirs = [
      getModelsPath('Uncategorized'),
      getMasksPath(),
    ]

    dirs.forEach((dir) => {
      try {
        fs.ensureDirSync(dir)
      } catch (error) {
        throw new AppError(`Could not create the directory:\n${dir}`, { error })
      }
    })
  }
}

export const system = new System()
