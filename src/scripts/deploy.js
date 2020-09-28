/* eslint-disable no-console */
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
const sha256File = require('sha256-file')
const { Release } = require('@dreamnet/deploy')
const pkg = require('../package.json')

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

//
process.env.DEPLOY_GIT_REPO = 'dreamtime'

const isEarly = process.env.DEPLOY_GIT_TAG.includes('-early') || process.env.DEPLOY_GIT_TAG.includes('-rc')

//
const VERSION = `v${pkg.version}`
const FILENAME = `DreamTime-${VERSION}-${process.env.BUILD_PLATFORM}`
const DISTPATH = path.resolve(__dirname, '../../dist')
const PROVIDERS = []

if (isRelease) {
  PROVIDERS.push('Github', 'Pinata', 'MEGA', 'Teknik')
}

/**
 *
 *
 * @param {Release} release
 */
async function run(release) {
  release.addProvider(PROVIDERS)

  release.on('upload_begin', (provider) => {
    console.log(`Uploading to ${provider.label}...`)
  })

  release.on('upload_success', (result, provider) => {
    console.log(`✔️ Uploaded to ${provider.label}!`)
  })

  release.on('upload_fail', (error, provider) => {
    console.warn(`❌ Upload to ${provider.label} failed: ${error.message}`)
  })

  release.on('pin_begin', (provider) => {
    console.log(`Pinning to ${provider.label}...`)
  })

  release.on('pin_success', (cid, provider) => {
    console.log(`✔️ Pinned to ${provider.label}!`)
  })

  release.on('pin_fail', (error, provider) => {
    console.log(`❌ Pin to ${provider.label} failed: ${error.message}`)
  })

  const response = await release.run()

  if (isEarly) {
    output.push(release.cryptr.encrypt(JSON.stringify(response)))
  } else {
    output.push(response)
  }
}

/**
 *
 *
 */
async function start() {
  const portablePath = path.resolve(DISTPATH, `${FILENAME}-portable.zip`)
  const installerPath = path.resolve(DISTPATH, `${FILENAME}-installer.${process.env.BUILD_EXTENSION}`)

  const releasePath = fs.existsSync(portablePath) ? portablePath : installerPath

  if (fs.existsSync(releasePath)) {
    const checksum = sha256File(releasePath)

    console.log(releasePath)
    console.log(`Checksum (sha256): ${checksum}`)

    if (PROVIDERS.length > 0) {
      const release = new Release(releasePath)
      await run(release)

      // Print results
      console.log(JSON.stringify(output, null, 2))
    }
  } else {
    console.warn(`The file does not exist: ${releasePath}`)
  }
}

start()
