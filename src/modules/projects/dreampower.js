import { isNil } from 'lodash'
import { dreampower as updater } from '../updater'
import { dreamtrack } from '../services'
import { requirements } from '../system'

const { getPowerPath } = $provider.paths
const { shell } = $provider.api

class DreamPower {
  data = {
    repository: {
      github: 'dreamnettech/dreampower',
    },
    about: {
      title: 'DreamPower',
      description: 'Nudification algorithm. Transform the photo of a woman with clothes into a fake nude.',
      logo: 'https://link.dreamnet.tech/ipfs/QmXNNcW85FC2QQcrBEsk88Ahs6na9D5q72cm3pJAEg857A?filename=dreampower-logo-512x512.png',
      navigation: [
        {
          icon: 'star',
          href: 'https://power.dreamnet.tech',
          label: 'Website',
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
    return this.updater.version
  }

  get isInstalled() {
    return !isNil(this.version) && this.version !== 'v0.0.0'
  }

  async init() {
    if (dreamtrack.enabled) {
      this.data = dreamtrack.get('projects.dreampower', this.data)
    }

    await this.updater.setup(!requirements.canNudify)
  }

  openAppFolder() {
    shell.openPath(getPowerPath())
  }
}

export const dreampower = new DreamPower()
