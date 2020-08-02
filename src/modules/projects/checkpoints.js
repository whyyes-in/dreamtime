import { checkpoints as updater } from '../updater'
import { dreamtrack } from '../services'
import { requirements } from '../system'

const { getPowerPath } = $provider.paths
const { shell } = $provider.api

class Checkpoints {
  data = {
    repository: {
      github: 'dreamnettech/dreampower-checkpoints',
    },
    about: {
      title: 'Checkpoints',
      description: 'DeepNude pre-trained models.',
      logo: 'https://link.dreamnet.tech/ipfs/QmWkpwjEq6YQLSud4pS8ChkdED4NZrup6fKirFXXXLFe9u?filename=deepnude.png',
      navigation: [],
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
    return this.updater.currentVersion
  }

  async init() {
    if (dreamtrack.enabled) {
      this.data = dreamtrack.get('projects.checkpoints', this.data)
    }

    await this.updater.setup(!requirements.canNudify)
  }

  openAppFolder() {
    shell.openPath(getPowerPath('checkpoints'))
  }
}

export const checkpoints = new Checkpoints()
