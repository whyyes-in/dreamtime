/* eslint-disable no-await-in-loop */
import EventEmitter from 'events'
import path from 'path'
import fs from 'fs-extra'
import {
  filter, find, flattenDeep, flatMapDeep, attempt,
} from 'lodash'
import axios from 'axios'
import URI from 'urijs'
import compareVersions from 'compare-versions'
import delay from 'delay'
import { dreamtrack } from '../services'
import { Consola } from '../consola'

const { system, paths } = $provider
const { platform } = $provider.util
const { dialog } = $provider.api
const { download } = $provider.fs

const GITHUB_API = 'https://api.github.com/repos'
const GITHUB_RAW_API = 'https://raw.githubusercontent.com/dreamnettech/data/master'

const METHOD = {
  ANY: 'any',
  HTTP: 'http',
  IPFS: 'ipfs',
}

function getFilename(url) {
  const uri = new URI(url)

  if (uri.hasQuery('filename')) {
    return uri.query(true).filename
  }

  return uri.filename()
}

export class BaseUpdater extends EventEmitter {
  /**
   *
   *
   */
  enabled = false

  /**
   * @type {Consola}
   */
  consola

  /**
   *
   *
   */
  status = {
    active: false,
    message: null,
    progress: 0,
    written: -1,
    total: -1,
    peers: -1,
  }

  /**
   * Github releases.
   */
  githubReleases = []

  /**
   * Server releases.
   */
  releases = []

  /**
   * Current version.
   * @type {string | undefined}
   */
  version

  /**
   * Desired version.
   * @type {string}
   */
  destVersion

  /**
   *
   *
   */
  downloads = {
    [METHOD.HTTP]: [],
    [METHOD.IPFS]: [],
  }

  /**
   *
   */
  urls = []

  /**
   *
   *
   */
  serverRecords

  /**
   *
   */
  method = METHOD.ANY

  /**
   * @type {string | undefined}
   */
  filename

  /**
   * @type {EventEmitter}
   */
  process

  /**
   *
   * @type {string | undefined}
   * @readonly
   */
  get name() {
    return undefined
  }

  /**
   *
   * @type {string | undefined}
   * @readonly
   */
  get displayName() {
    return dreamtrack.get(`projects.${this.name}.about.title`, this.name)
  }

  /**
   *
   *
   * @readonly
   */
  get platform() {
    return platform({
      macos: 'macos',
      windows: 'windows',
      linux: 'linux',
    })
  }

  /**
   *
   * @type {string | undefined}
   * @readonly
   */
  get arch() {
    return undefined
  }

  get filenameSearch() {
    return this.platform
  }

  /**
   *
   *
   * @readonly
   */
  get serverBaseURI() {
    const uri = new URI(process.env.DOWNLOADS_API)

    uri.segment('v2')
      .segment(this.name)
      .segment(this.latestVersion)

    uri.addQuery({
      platform: this.platform,
      arch: this.arch,
    })

    return uri
  }

  get githubRawBaseURI() {
    const uri = new URI(GITHUB_RAW_API)

    uri.segment('downloads')
      .segment(this.name)
      .segment(this.latestVersion)
      .segment(this.platform)
      .segment(this.arch)

    return uri
  }

  /**
   *
   * @type {string | undefined}
   * @readonly
   */
  latestVersion

  /**
   *
   */
  get hasIPFS() {
    return this.downloads[METHOD.IPFS].length > 0
  }

  /**
   *
   *
   * @readonly
   */
  get available() {
    if (!this.enabled) {
      return false
    }

    if (!this.version) {
      return true
    }

    return compareVersions.compare(this.latestVersion, this.version, '>')
  }

  /**
   *
   *
   * @readonly
   */
  get repo() {
    return dreamtrack.get(`projects.${this.name}.repository.github`)
  }

  constructor() {
    super()
    this.consola = Consola.create(`updater:${this.name}`)
  }

  async setup() {
    this.enabled = false

    try {
      if (!system.online) {
        throw new Warning('There is no Internet connection. Please make sure you are connected before starting.')
      }

      this.version = await this.getVersion()

      await this.fetchGithubReleases()

      await this.fetchReleases()

      await this.refresh()

      if (this.urls.length === 0) {
        throw new Warning('No available download links, please try again later.')
      }

      this.filename = await this.getFilename()

      if (this.version) {
        this.consola.info(`${this.version} - Latest: ${this.latestVersion}`)
      } else {
        this.consola.info(`❌ Not installed - Latest: ${this.latestVersion}`)
      }

      this.consola.info(`Downloads: ${this.urls.length} (${this.method}) - ${this.filename}`)

      this.enabled = true

      if (this.available) {
        this.sendNotification()
      }
    } catch (error) {
      this.error = error
      this.consola.warn(this.error)
    }
  }

  async getVersion() {
    return undefined
  }

  async fetchGithubReleases() {
    const response = await axios.get('/releases', {
      baseURL: `${GITHUB_API}/${this.repo}`,
      timeout: 6000,
    })

    this.githubReleases = filter(response.data, { draft: false })

    if (this.githubReleases.length === 0) {
      this.consola.warn('Github returned no releases!')
      return
    }

    this.latestGithubRelease = find(this.githubReleases, { prerelease: false })
    this.latestVersion = undefined

    if (!this.latestGithubRelease) {
      this.consola.warn('Unable to get the latest version.')
      return
    }

    const latestVersion = this.latestGithubRelease?.tag_name

    if (latestVersion) {
      if (latestVersion[0] !== 'v') {
        latestVersion = `v${latestVersion}`
      }

      this.latestVersion = latestVersion
    }

    this.destVersion = this.latestVersion
  }

  async fetchReleases() {
    const response = await axios.get(`/v2/${this.name}`, {
      baseURL: process.env.DOWNLOADS_API,
      timeout: 5000,
    })

    this.releases = response.data

    if (!this.latestVersion) {
      if (this.releases.length === 0) {
        throw new Error('Unable to get the latest version.')
      }

      this.latestVersion = this.releases[0].version
    }
  }

  async refresh() {
    await this.setupDownloads()
  }

  async setupDownloads() {
    // Reset
    this.downloads = {
      [METHOD.HTTP]: [],
      [METHOD.IPFS]: [],
    }

    // Downloads server
    await this.setupServer()

    // HTTP
    await this.setupHTTPDownloads()

    // IPFS
    await this.setupIPFSDownloads()

    // Final download urls
    if (this.method === METHOD.ANY) {
      this.urls = flatMapDeep(this.downloads, (record) => [record])
    } else {
      this.urls = this.downloads[this.method]
    }

    // console.log(this.name, this.urls)
  }

  async setupServer() {
    try {
      // DreamNet server
      const response = await axios.get(`/v2/${this.name}/${this.latestVersion}/records.json`, {
        baseURL: process.env.DOWNLOADS_API,
        timeout: 3000,
        params: {
          platform: this.platform,
          arch: this.arch,
        },
      })

      this.serverRecords = response.data
    } catch (e) {
      console.warn(e)
    }

    if (!this.serverRecords) {
      try {
        // Github repo
        const response = await axios.get(`${this.githubRawBaseURI}/records.json`, { timeout: 3000 })
        this.serverRecords = response.data
      } catch (e) {
        console.warn(e)
      }
    }
  }

  async setupHTTPDownloads() {
    const downloads = []

    // DreamNet server
    if (this.serverRecords) {
      // Server available
      downloads.push(this.serverBaseURI)

      // All CDN urls.
      filter(this.serverRecords, { type: 'http', status: 1, is_direct: 1 }).forEach((record) => {
        downloads.push(record.url)
      })
    }

    // Github
    if (this.latestGithubRelease) {
      let asset

      if (this.latestGithubRelease.assets.length === 1) {
        [asset] = this.latestGithubRelease.assets
      } else {
        asset = find(this.latestGithubRelease.assets, (record) => record.name.includes(this.filenameSearch))
      }

      if (asset) {
        downloads.push(asset.browser_download_url)
      }
    }

    // Commit
    this.downloads[METHOD.HTTP] = downloads
  }

  async setupIPFSDownloads() {
    const downloads = []

    // DreamNet server
    if (this.serverRecords) {
      // All CDN urls.
      filter(this.serverRecords, { type: 'ipfs', status: 1 }).forEach((record) => {
        downloads.push(record.url)
      })

      if (downloads.length === 0) {
        const ipfsRecord = find(this.serverRecords, (record) => record.url.includes('ipfs/'))

        if (ipfsRecord) {
          const match = ipfsRecord.url.match(/^https?:\/\/[^/]+\/(ip[fn]s)\/([^/?#]+)/)

          if (match && match[2]) {
            downloads.push(match[2])
          }
        }
      }
    }

    // Commit
    this.downloads[METHOD.IPFS] = downloads
  }

  async getFilename() {
    if (this.downloads[METHOD.HTTP].length === 0) {
      return undefined
    }

    for (const url of this.downloads[METHOD.HTTP]) {
      const filename = getFilename(url)
      const match = filename.match(/^([^/?#]+)\.(zip|7z|exe|dmg|snap|AppImage|rpm)/)

      if (match && match[0]) {
        return filename
      }
    }

    return undefined
  }

  setStatus(message, clear = false) {
    if (clear) {
      this.clearStatus()
    }

    this.status = {
      ...this.status,
      active: true,
      message,
    }
  }

  clearStatus() {
    this.status = {
      active: false,
      message: null,
      progress: 0,
      written: -1,
      total: -1,
      peers: -1,
    }
  }

  setStatusProgress(progress, written = -1, total = -1) {
    this.status = {
      ...this.status,
      progress,
      written,
      total,
    }
  }

  pause() {
    if (!this.process) {
      return
    }

    this.process.emit('pause')
  }

  resume() {
    if (!this.process) {
      return
    }

    this.process.emit('resume')
  }

  cancel() {
    if (!this.process) {
      return
    }

    this.process.emit('cancel')
  }

  async start() {
    try {
      const filepath = paths.getPath('downloads', this.filename)

      if (this.localInstall(filepath)) {
        await this.install(filepath)
      }

      await this.downloadAndInstall(filepath)
    } catch (error) {
      throw new Warning('', '')
    } finally {
      this.clearStatus()
    }
  }

  localInstall(filepath) {
    if (!fs.existsSync(filepath)) {
      return false
    }

    const question = dialog.showMessageBoxSync({
      type: 'question',
      buttons: ['Yes', 'No, download it again'],
      title: 'File already downloaded.',
      message: 'It seems that you have already downloaded this component, do you want to use the file from your downloads folder?',
    })

    if (question === 0) {
      return true
    }

    attempt(() => {
      fs.unlinkSync(filepath)
    })

    return false
  }

  async install(filepath) {
    if (!fs.existsSync(filepath)) {
      throw new Error('The file does not exist, the download may have been interrupted or there is no disk space.')
    }

    this.setStatus('installing')

    await delay(1500)

    await this.customInstall(filepath)
  }

  async customInstall() {
    throw new Error('Not implemented.')
  }

  async downloadAndInstall(filepath) {
    let lastError

    for (const url of this.urls) {
      try {
        this.setStatus('preparing', true)

        await this.download(url, filepath)

        await this.install(filepath)

        lastError = undefined
        break
      } catch (error) {
        lastError = error
        this.consola.warn(`Installation failed from "${url}": ${error.message}`)
      } finally {
        this.process = undefined
      }
    }

    if (lastError) {
      throw new Error(`Installation failed from all mirrors, the last error message was: ${lastError.message}`)
    }
  }

  download(url, filepath) {
    this.consola.info(`Downloading update from: ${url}`)

    if (this.method === METHOD.ANY) {
      consola.track('DOWNLOAD_ANY', url)
    }

    if (this.method === METHOD.HTTP) {
      consola.track('DOWNLOAD_HTTP', url)
    }

    if (this.method === METHOD.IPFS) {
      consola.track('DOWNLOAD_IPFS', url)
    }

    return new Promise((resolve, reject) => {
      this.process = download(url, { filepath })

      this.process.on('progress', (payload) => {
        this.setStatus('downloading')
        this.setStatusProgress(payload.progress, payload.written, payload.total)
      })

      this.process.on('peers', (value) => { this.status.peers = value })

      this.process.on('error', (error) => {
        reject(error)
      })

      this.process.on('finish', () => {
        resolve()
      })

      this.process.on('cancelled', () => {
        resolve()
      })
    })
  }

  sendNotification() {
    this.consola.warn('sendNotification not implemented!')
  }
}
