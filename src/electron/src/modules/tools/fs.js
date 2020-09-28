import {
  attempt, startsWith, merge, endsWith,
} from 'lodash'
import { basename, join } from 'path'
import fs from 'fs-extra'
import { app, dialog } from 'electron'
import axios from 'axios'
import https from 'https'
import deferred from 'deferred'
import chokidar from 'chokidar'
import WebTorrent from 'webtorrent'
import IpfsCtl from 'ipfsd-ctl'
import toStream from 'it-to-stream'
import all from 'it-all'
import { EventEmitter } from 'events'
import { getAppResourcesPath, getPath } from './paths'

const logger = require('@dreamnet/logplease').create('electron:modules:tools:fs')

// eslint-disable-next-line node/no-deprecated-api
export * from 'fs-extra'

/**
 * @typedef DownloadOptions
 * @property {boolean} showSaveAs
 * @property {string} directory
 * @property {string} filename
 * @property {string} filepath
 */

/**
 * Returns the base64 of a dataURL
 * @param {*} dataURL
 */
export function getBase64Data(dataURL) {
  let encoded = dataURL.replace(/^data:(.*;base64,)?/, '')

  if (encoded.length % 4 > 0) {
    encoded += '='.repeat(4 - (encoded.length % 4))
  }

  return encoded
}

/**
 *
 * @param {string} path
 * @param {string} encoding
 */
export function read(path, encoding = 'utf-8') {
  return fs.readFileSync(path, { encoding })
}

/**
 *
 * @param {string} path
 * @param {string} dataURL
 */
export function writeDataURL(path, dataURL) {
  const data = this.getBase64Data(dataURL)
  return fs.outputFileSync(path, data, 'base64')
}

/**
 *
 * @param {string} path
 * @param {string} destinationPath
 */
export function extractZip(path, destinationPath) {
  const unzipper = require('unzipper')

  const def = deferred()

  const stream = fs.createReadStream(path).pipe(unzipper.Extract({ path: destinationPath }))

  stream.on('close', () => {
    def.resolve()
  })

  stream.on('error', (err) => {
    def.reject(err)
  })

  return def.promise
}

/**
 *
 * @param {string} path
 * @param {string} destinationPath
 */
export function extractSeven(path, destinationPath) {
  const { is, platform } = require('electron-util')
  const { extractFull } = require('node-7z')

  const def = deferred()

  let pathTo7zip

  if (is.development) {
    const sevenBin = require('7zip-bin')
    pathTo7zip = sevenBin.path7za
  } else {
    const binName = platform({
      macos: '7za',
      linux: '7za',
      windows: '7za.exe',
    })

    pathTo7zip = getAppResourcesPath('7zip-bin', binName)
  }

  const seven = extractFull(path, destinationPath, {
    $bin: pathTo7zip,
    recursive: true,
  })

  seven.on('end', () => {
    def.resolve()
  })

  seven.on('error', (err) => {
    def.reject(err)
  })

  return def.promise
}

/**
 *
 *
 * @export
 * @param {string} url
 * @param {*} options
 * @param {EventEmitter} events
 * @param {fs.WriteStream} writeStream
 */
export async function downloadFromHttp(url, options, events, writeStream) {
  let readStream
  let headers

  try {
    const request = await axios.request({
      url,
      responseType: 'stream',
      maxContentLength: -1,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    })

    readStream = request.data
    headers = request.headers
  } catch (err) {
    events.emit('error', err)
    return
  }

  // Close handler
  events.on('close', () => {
    attempt(() => {
      if (readStream) {
        readStream.destroy()
      }
    })
  })

  const contentLength = headers['content-length'] || -1

  readStream.on('error', (err) => {
    events.emit('error', err)
  })

  readStream.on('data', () => {
    events.emit('progress', {
      progress: (writeStream.bytesWritten / contentLength),
      written: (writeStream.bytesWritten / 1048576).toFixed(2),
      total: (contentLength / 1048576).toFixed(2),
    })
  })

  readStream.pipe(writeStream)
}

/**
 *
 *
 * @export
 * @param {string} cid
 * @param {DownloadOptions} options
 * @param {EventEmitter} events
 * @param {fs.WriteStream} writeStream
 */
export async function downloadFromIPFS(cid, options, events, writeStream) {
  /** @type {import('ipfsd-ctl/src/ipfsd-daemon')} */
  let node
  let stats
  let readStream

  // Close handler
  events.on('close', () => {
    attempt(() => {
      if (readStream) {
        readStream.destroy()
      }

      if (node) {
        node.stop()
        node = null
      }
    })
  })

  // Utility functions
  const createNode = async function () {
    const ipfsBin = require('go-ipfs-dep').path().replace('app.asar', 'app.asar.unpacked')

    logger.debug('Creating IPFS node...')
    logger.debug(ipfsBin)

    fs.ensureDirSync(getPath('temp', 'ipfs'))

    node = await IpfsCtl.createController({
      ipfsHttpModule: require('ipfs-http-client'),
      ipfsBin,
      ipfsOptions: {
        repo: getPath('temp', 'ipfs'),
        start: true,
        init: true,
      },
      remote: false,
      disposable: false,
      test: false,
      type: 'go',
    })

    await node.init()

    await node.start()

    if (!node.api) {
      logger.debug(node)
      throw new Error('The IPFS node was not created correctly.')
    }
  }

  const connectToProviders = async function () {
    logger.debug('Connecting to providers...')

    try {
      await node.api.swarm.connect('/dns4/mariana.dreamnet.tech/tcp/4001/p2p/QmcWoy1FzBicbYuopNT2rT6EDQSBDfco1TxibEyYgWbiMq')
    } catch (err) {
      logger.warn(err)
    }
  }

  try {
    await createNode()

    await connectToProviders()

    logger.debug('Connected!')

    if (!node) {
      // It seems that the user has canceled it
      return
    }

    logger.debug(`Obtaining download information... (${cid})`)

    stats = await node.api.object.stat(cid, { timeout: 30000 })

    // eslint-disable-next-line no-console
    console.log(stats)

    logger.debug('Downloading...')

    readStream = toStream.readable(node.api.cat(cid))
  } catch (err) {
    events.emit('error', err)
    return
  }

  // eslint-disable-next-line promise/always-return
  all(node.api.dht.findProvs(cid, { timeout: 30000 })).then((provs) => {
    events.emit('peers', provs.length)
  }).catch(() => { })

  readStream.on('error', (err) => {
    events.emit('error', err)
  })

  readStream.on('data', () => {
    const progress = writeStream.bytesWritten / stats.CumulativeSize

    events.emit('progress', {
      progress,
      written: (writeStream.bytesWritten / 1048576).toFixed(2),
      total: (stats.CumulativeSize / 1048576).toFixed(2),
    })
  })

  readStream.pipe(writeStream)
}

/**
 *
 *
 * @export
 * @param {string} magnetURI
 * @param {DownloadOptions} options
 * @param {EventEmitter} events
 * @param {fs.WriteStream} writeStream
 */
export function downloadFromTorrent(magnetURI, options, events, writeStream) {
  let client
  let torrent

  // Error handler
  events.on('close', () => {
    attempt(() => {
      if (torrent) {
        torrent.destroy()
      }

      if (client) {
        client.destroy()
      }
    })
  })

  try {
    client = new WebTorrent()

    torrent = client.add(magnetURI)
  } catch (err) {
    events.emit('error', err)
    return
  }

  const timeout = setTimeout(() => {
    events.emit('error', new Error('timeout'))
  }, 3000)

  client.on('error', (err) => {
    events.emit('error', err)
  })

  torrent.on('error', (err) => {
    events.emit('error', err)
  })

  torrent.on('metadata', () => {
    clearTimeout(timeout)

    if (torrent.files.length > 1) {
      events.emit('error', new Error('The torrent contains more than one file.'))
      return
    }

    events.emit('peers', torrent.numPeers)

    const file = torrent.files[0]

    file.createReadStream().pipe(writeStream)
  })

  torrent.on('download', () => {
    events.emit('progress', {
      progress: torrent.progress,
      written: (torrent.downloaded / 1048576).toFixed(2),
      total: (torrent.length / 1048576).toFixed(2),
    })
  })

  torrent.on('wire', () => {
    events.emit('peers', torrent.numPeers)
  })

  /*
  torrent.on('done', () => {
    // Finish & Close
    events.emit('finish', options.filepath)
    events.emit('close')
  })
  */
}

/**
 *
 * @param {string} url
 * @param {DownloadOptions} [options]
 */
export function download(url, options = {}) {
  const events = new EventEmitter()

  let cancelled = false

  // Options setup
  options = merge({
    showSaveAs: false,
    directory: app.getPath('downloads'),
    filename: basename(url).split('?')[0].split('#')[0],
  }, options)

  options.filepath = join(options.directory, options.filename)

  if (options.showSaveAs) {
    options.filepath = dialog.showSaveDialogSync({
      defaultPath: options.filepath,
    })
  }

  // Write stream
  const writeStream = fs.createWriteStream(options.filepath)

  writeStream.on('error', (err) => {
    events.emit('error', err)
  })

  writeStream.on('finish', () => {
    if (cancelled) {
      events.emit('cancelled')
      return
    }

    // Finish & Close
    events.emit('finish', options.filepath)
    events.emit('close')
  })

  // Cancel handler
  events.on('cancel', () => {
    cancelled = true

    attempt(() => {
      fs.unlinkSync(options.filepath)
    })

    logger.info('Download cancelled by user.')

    // Cancelled & Close
    events.emit('cancelled')
    events.emit('close')
  })

  // Error handler
  events.on('error', (err) => {
    attempt(() => {
      fs.unlinkSync(options.filepath)
    })

    logger.warn('Download error:', err)

    // Error & Close
    events.emit('close')
  })

  // Close handler
  events.on('close', () => {
    attempt(() => {
      writeStream.destroy()
    })
  })

  // Download!
  if (startsWith(url, 'Qm')) {
    downloadFromIPFS(url, options, events, writeStream)
  } else if (startsWith(url, 'magnet:') || endsWith(url, '.torrent')) {
    downloadFromTorrent(url, options, events, writeStream)
  } else if (startsWith(url, 'http')) {
    downloadFromHttp(url, options, events, writeStream)
  } else {
    setTimeout(() => {
      events.emit('error', new Error('Invalid download address.'))
    }, 0)
  }

  return events
}

/**
 *
 * @param {string} url
 * @param {Object} [options]
 */
export function downloadAsync(url, options = {}) {
  return new Promise((resolve, reject) => {
    const bus = download(url, options)

    bus.on('finish', (filepath) => {
      resolve(filepath)
    })

    bus.on('error', (err) => {
      reject(err)
    })
  })
}

export { chokidar }
