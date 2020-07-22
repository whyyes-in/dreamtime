import {
  find, remove, sortBy, reverse,
} from 'lodash'
import { Queue } from '@dreamnet/queue'
import { File } from './file'
import { Consola } from './consola'

const consola = Consola.create('photos')
const { fs } = $provider
const { getModelsPath } = $provider.paths

class Photos {
  /**
   * @type {File[]}
   */
  files = []

  /**
   * @type {Queue}
   */
  queue

  get folder() {
    return getModelsPath('Uncategorized')
  }

  async setup() {
    this.queue = new Queue(this.worker.bind(this), {
      delay: 10,
    })

    this.queue.on('finished', () => {
      this.sort()
    })

    fs.chokidar.watch(this.folder, {
      disableGlobbing: true,
      awaitWriteFinish: true,
    }).on('add', (path) => {
      this.queue.add({
        event: 'add',
        path,
      })
    }).on('unlink', (path) => {
      this.queue.add({
        event: 'unlink',
        path,
      })
    }).on('error', (error) => {
      // This silence errors when deleting files.
      consola.warn(error)
    })
  }

  async worker(task) {
    const { event, path } = task

    if (event === 'add') {
      await this.add(path)
    } else {
      await this.unlink(path)
    }
  }

  async add(path) {
    let file = this.getFile(path)

    if (file) {
      file.load()
    } else {
      file = await File.fromPath(path, { watch: false })
      this.files.push(file)
    }
  }

  unlink(path) {
    this.removeFile(path)
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
