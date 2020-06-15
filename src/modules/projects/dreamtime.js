import { isNil } from 'lodash'
import { dreamtime as updater } from '../updater'
import { dreamtrack } from '../services'

const { getAppPath, getPath } = $provider.paths
const { shell } = $provider.api

class DreamTime {
  data = {
    repository: {
      github: 'dreamnettech/dreamtime',
    },
    about: {
      title: process.env.npm_package_displayName,
      description: process.env.npm_package_description,
      logo: 'https://link.dreamnet.tech/ipfs/QmQi3xmEi4trvitGzps1k4XJwwUnWikPo4iowG3BJzHJqQ?filename=dreamtime-logo-512x512.png',
      navigation: [
        {
          icon: 'star',
          href: 'https://time.dreamnet.tech',
          label: 'Website',
        },
        {
          icon: 'comment',
          href: 'https://time.dreamnet.tech/docs/support/feedback',
          label: 'Feedback',
          description: 'Help us improve DreamTime!',
        },
      ],
    },
  }

  updater = updater

  get name() {
    return this.data.about.title
  }

  get description() {
    return this.data.about.description
  }

  get logo() {
    return this.data.about.logo
  }

  get version() {
    return `v${process.env.npm_package_version}`
  }

  get isPortable() {
    return !isNil(process.env.BUILD_PORTABLE)
  }

  async init() {
    if (dreamtrack.enabled) {
      this.data = dreamtrack.get('projects.dreamtime', this.data)
    }

    await this.updater.setup()
  }

  openAppFolder() {
    shell.openPath(getAppPath())
  }

  openAppDataFolder() {
    shell.openPath(getPath('userData'))
  }
}

export const dreamtime = new DreamTime()
