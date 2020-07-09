import {
  find, remove, sortBy, reverse,
} from 'lodash'
import { File } from './file'

const { fs } = $provider
const { getModelsPath } = $provider.paths

class Photos {
  /**
   * @type {File[]}
   */
  files = []

  get folder() {
    return getModelsPath('Uncategorized')
  }

  async setup() {
    fs.chokidar.watch(this.folder, {
      disableGlobbing: true,
      awaitWriteFinish: true,
    }).on('add', (path) => {
      this.onAdded(path)
    }).on('unlink', (path) => {
      this.onRemoved(path)
    })
  }

  async onAdded(path) {
    let file = this.getFile(path)

    if (file) {
      file.load()
    } else {
      file = await File.fromPath(path, { watch: false })
      this.files.push(file)
    }

    this.sort()
  }

  onRemoved(path) {
    this.removeFile(path)
    this.sort()
  }

  sort() {
    this.files = sortBy(this.files, 'birthtime')
    reverse(this.files)
  }

  getFile(path) {
    return find(this.files, (file) => file.isSamePath(path))
  }

  removeFile(path) {
    // eslint-disable-next-line lodash/prefer-immutable-method
    return remove(this.files, (file) => file.isSamePath(path))
  }
}

export const photos = new Photos()
