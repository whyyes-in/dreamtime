// DreamTime.
// Copyright (C) DreamNet. All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License 3.0 as published by
// the Free Software Foundation. See <https://www.gnu.org/licenses/gpl-3.0.html>
//
// Written by Ivan Bravo Bravo <ivan@dreamnet.tech>, 2019.

import { BaseUpdater } from './base'
import dream from '../dream'

const { activeWindow, platform } = $provider.util
const { shell, app, Notification } = $provider.api

class DreamTimeUpdater extends BaseUpdater {
  /**
   * @type {string}
   */
  get name() {
    return 'dreamtime'
  }

  /**
   * @type {string}
   */
  get repo() {
    return super.repo || 'dreamnettech/dreamtime'
  }

  get arch() {
    return dream.isPortable ? 'portable' : undefined
  }

  get filenameSearch() {
    return `${this.platform}-${process.env.BUILD_ARCH}`
  }

  get serverBaseURI() {
    const uri = super.serverBaseURI

    uri.addQuery({
      format: process.env.BUILD_FORMAT,
    })

    return uri
  }

  async getVersion() {
    return `v${process.env.npm_package_version}`
  }

  async getFilename() {
    return (await super.getFilename()) || `DreamTime-${this.latestVersion}-${this.platform}-${process.env.BUILD_ARCH}.${process.env.BUILD_FORMAT}`
  }

  /**
   *
   * @param {string} filepath
   */
  async install(filepath) {
    shell.showItemInFolder(filepath)

    // Quit to update
    app.quit()
  }

  /**
   *
   */
  sendNotification() {
    const notification = new Notification(
      {
        title: `🎉 DreamTime ${this.latestCompatibleVersion}`,
        body: 'A new version of DreamTime is available.',
      },
    )

    notification.show()

    notification.on('click', () => {
      window.$redirect('/wizard/dreamtime')

      if (activeWindow()) {
        activeWindow().focus()
      }
    })
  }
}

export const dreamtime = new DreamTimeUpdater()
