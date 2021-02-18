/* eslint-disable camelcase, no-console */
// DreamTime.
// Copyright (C) DreamNet. All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License 3.0 as published by
// the Free Software Foundation. See <https://www.gnu.org/licenses/gpl-3.0.html>
//
// Written by Ivan Bravo Bravo <ivan@dreamnet.tech>, 2020.

const path = require('path')
const fs = require('fs')
const axios = require('axios')
const sha256File = require('sha256-file')
const uuid = require('uuid')
const { Release } = require('@dreamnet/deploy')
const pkg = require('../package.json')

/*
process.env.BUILD_PLATFORM = 'windows'
process.env.BUILD_EXTENSION = 'exe'
process.env.DREAMTRACK_HOST = 'http://localhost:30200'
process.env.DREAMTRACK_KEY = ''
process.env.GITHUB_REF = 'refs/tags/v0.0.0-early'
process.env.DEPLOY_MINIO_ADDRESS = '/ip4/127.0.0.1/tcp/19000/http'
process.env.DEPLOY_MINIO_BUCKET = 'dreamtime-early'
process.env.DEPLOY_MINIO_KEY = 'root'
process.env.DEPLOY_MINIO_SECRET = 'secret123'
*/

//
const output = []

//
let isRelease = false

if (process.env.GITHUB_REF) {
  isRelease = process.env.GITHUB_REF.substring(0, 9) === 'refs/tags'
  // eslint-disable-next-line prefer-destructuring
  process.env.DEPLOY_GIT_TAG = process.env.GITHUB_REF.split('/')[2]
} else {
  process.env.DEPLOY_GIT_TAG = process.env.GITHUB_SHA.substring(0, 7)
}

// Defaults
process.env.DEPLOY_GIT_REPO = 'dreamtime'
process.env.DEPLOY_MINIO_FOLDER = `/releases/${process.env.DEPLOY_GIT_TAG}`

const isEarly = process.env.DEPLOY_GIT_TAG.includes('-early') || process.env.DEPLOY_GIT_TAG.includes('-rc')
let isPortable = false

//
const VERSION = `v${pkg.version}`
const FILENAME = `DreamTime-${VERSION}-${process.env.BUILD_PLATFORM}`
const DISTPATH = path.resolve(__dirname, '../../dist')
const PROVIDERS = []

if (isRelease) {
  PROVIDERS.push('Minio', 'DreamLinkCluster', 'Pinata', 'MEGA')

  if (isEarly) {
    process.env.DEPLOY_MINIO_BUCKET = 'dreamtime-early'
    process.env.DEPLOY_MINIO_GATEWAY = undefined
  } else {
    PROVIDERS.push('Github', 'Teknik')
  }
}

/**
 *
 *
 * @param {Release} release
 */
async function run(release) {
  release.addProvider(PROVIDERS)

  release.on('upload:begin', (provider) => {
    console.log(`Uploading to ${provider.label}...`)
  })

  release.on('upload:success', (result, provider) => {
    console.log(`✔️ Uploaded to ${provider.label}!`)
  })

  release.on('upload:fail', (error, provider) => {
    console.warn(`❌ Upload to ${provider.label} failed: ${error.message}`)
  })

  release.on('pin:begin', (provider) => {
    console.log(`Pinning to ${provider.label}...`)
  })

  release.on('pin:success', (cid, provider) => {
    console.log(`✔️ Pinned to ${provider.label}!`)
  })

  release.on('pin:fail', (error, provider) => {
    console.log(`❌ Pin to ${provider.label} failed: ${error.message}`)
  })

  const response = await release.deploy()

  if (isEarly && release.cryptr) {
    output.push(release.cryptr.encrypt(JSON.stringify(response)))
  } else {
    output.push(response)
  }

  return response
}

/**
 *
 *
 * @param {Release} release
 */
async function deploy(release, response, checksum) {
  const payload = []

  const { cid } = release

  const arch = isPortable ? 'portable' : undefined
  const archText = isPortable ? 'portable' : 'installer'
  const ext = isPortable ? 'zip' : process.env.BUILD_EXTENSION
  const platform = process.env.BUILD_PLATFORM === 'ubuntu' ? 'linux' : process.env.BUILD_PLATFORM

  // IPFS Gateways
  if (cid) {
    payload.push({
      platform,
      url: `https://link.dreamnet.tech/ipfs/${cid}?filename=${FILENAME}-${archText}.${ext}`,
      arch,
      checksum,
      priority: 25,
    })

    payload.push({
      platform,
      url: `https://gateway.ipfs.io/ipfs/${cid}?filename=${FILENAME}-${archText}.${ext}`,
      arch,
      checksum,
      priority: 20,
    })

    payload.push({
      platform,
      url: `https://gateway.pinata.cloud/ipfs/${cid}?filename=${FILENAME}-${archText}.${ext}`,
      arch,
      checksum,
      priority: 10,
    })
  }

  response.forEach((data) => {
    if (data.cid) {
      return
    }

    let priority = 1
    let is_direct = true

    if (data.url.includes('s3.dreamnet.tech')) {
      priority = 30
    } else if (data.url.includes('git.teknik.io')) {
      priority = 15
    } else if (data.url.includes('github.com')) {
      priority = 0
      is_direct = false
    }

    payload.push({
      platform,
      url: data.url,
      arch,
      checksum,
      priority,
      is_direct,
    })
  })

  try {
    console.log('Deploying to DreamTrack...')

    await axios({
      method: 'POST',
      baseURL: process.env.DREAMTRACK_HOST,
      url: `/downloads/dreamtime/${VERSION}`,
      headers: {
        Authorization: `Basic ${process.env.DREAMTRACK_KEY}`,
      },
      data: {
        payload,
        password: uuid.v4(),
      },
    })

    console.log('✔️ Done!')
  } catch (error) {
    console.warn(error)

    if (error.response && error.response.data) {
      console.warn(error.response.data.message)
    }
  }
}

/**
 *
 *
 */
async function start() {
  const portablePath = path.resolve(DISTPATH, `${FILENAME}-portable.zip`)
  const installerPath = path.resolve(DISTPATH, `${FILENAME}-installer.${process.env.BUILD_EXTENSION}`)

  if (fs.existsSync(portablePath)) {
    isPortable = true
  }

  const releasePath = isPortable ? portablePath : installerPath

  if (fs.existsSync(releasePath)) {
    const checksum = sha256File(releasePath)

    console.log(`Deploying: ${releasePath} (${checksum})`)

    if (PROVIDERS.length > 0) {
      const release = new Release(releasePath)

      const response = await run(release)
      await deploy(release, response, checksum)

      // Print results
      console.log(JSON.stringify(output, null, 2))
    }
  } else {
    console.warn(`The file does not exist: ${releasePath}`)
  }
}

start()
