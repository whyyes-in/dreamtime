// DreamTime.
// Copyright (C) DreamNet. All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License 3.0 as published by
// the Free Software Foundation. See <https://www.gnu.org/licenses/gpl-3.0.html>
//
// Written by Ivan Bravo Bravo <ivan@dreamnet.tech>, 2019.

import path from 'path'
import { isNil } from 'lodash'
import compareVersions from 'compare-versions'
import { BaseUpdater } from './base'
import { requirements, settings } from '../system'
import { dreamtrack } from '../services'

const { getWaifuPath } = $provider.paths
const { fs } = $provider
const { activeWindow } = $provider.util
const { app, Notification } = $provider.api

class WaifuUpdater extends BaseUpdater {
  /**
   * @type {string}
   */
  get name() {
    return 'waifu'
  }

  /**
   * @type {string}
   */
  get repo() {
    return super.repo || 'dreamnettech/waifu2x-chainer'
  }

  get arch() {
    return this.platform === 'macos' || settings.preferences.advanced.device === 'CPU' ? 'cpuonly' : 'any'
  }

  /**
   * @return {string}
   */
  async getVersion() {
    return requirements.waifu.version
  }

  /**
   *
   * @param {string} filepath
   */
  async install(filepath) {
    const waifuPath = getWaifuPath()

    // Removing the previous installation
    try {
      if (fs.existsSync(waifuPath)) {
        const files = await fs.readdir(waifuPath)

        for (const file of files) {
          fs.removeSync(path.join(waifuPath, file))
        }
      }
    } catch (error) {
      this.consola.warn(error)
    }

    // Extraction
    await fs.extractSeven(filepath, waifuPath)

    // Permissions for non-windows operating systems.
    if (process.platform !== 'win32') {
      try {
        fs.chmodSync(getWaifuPath('waifu2x'), 0o775)
      } catch (error) {
        this.consola.warn(error)
      }
    }

    // Restart!
    app.relaunch()
    app.quit()
  }

  /**
   *
   */
  sendNotification() {
    if (!requirements.waifu.installed) {
      return
    }

    const notification = new Notification(
      {
        title: `🎉 Waifu2X ${this.latestCompatibleVersion}`,
        body: 'A new version of Waifu2X is available.',
      },
    )

    notification.show()

    notification.on('click', () => {
      window.$redirect('/wizard/waifu')

      if (activeWindow()) {
        activeWindow().focus()
      }
    })
  }
}

export const waifu = new WaifuUpdater()
