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
const { Release } = require('@dreamnet/deploy')
const pkg = require('../package.json')

//
const output = []

//
const VERSION = `v${pkg.version}`
const FILENAME = `DreamTime-${VERSION}-${process.env.BUILD_PLATFORM}`
const DISTPATH = path.resolve(__dirname, '../../dist')
const PROVIDERS = [
  'Github',
  'Teknik',
  'DreamLinkCluster',
  'Pinata',
  'MEGA',
]

if (process.env.GITHUB_REF) {
  //
  process.env.DEPLOY_GIT_REPO = 'dreamtime'
  // eslint-disable-next-line prefer-destructuring
  process.env.DEPLOY_GIT_TAG = process.env.GITHUB_REF.split('/')[2]
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

  release.on('upload_success', (provider) => {
    console.log(`✔️ Uploaded to ${provider.label}!`)
  })

  release.on('upload_fail', (error, provider) => {
    console.warn(`❌ Upload to ${provider.label} failed: ${error.message}`)
  })

  release.on('pin_begin', (provider) => {
    console.log(`Pinning to ${provider.label}...`)
  })

  release.on('pin_success', (provider) => {
    console.log(`✔️ Pinned to ${provider.label}!`)
  })

  release.on('pin_fail', (error, provider) => {
    console.log(`❌ Pin to ${provider.label} failed: ${error.message}`)
  })

  const response = await release.run()

  if (process.env.DEPLOY_GIT_TAG.includes('early')) {
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
  const installerPath = path.resolve(DISTPATH, `${FILENAME}.${process.env.BUILD_EXTENSION}`)
  const portablePath = path.resolve(DISTPATH, `${FILENAME}-portable.zip`)

  // Installer
  if (fs.existsSync(installerPath)) {
    console.log(`Installer: ${installerPath}`)

    const installer = new Release(installerPath)
    await run(installer)
  } else {
    console.warn(`The installable version does not exist: ${installerPath}`)
  }

  // Portable
  if (fs.existsSync(installerPath)) {
    console.log(`Portable: ${portablePath}`)

    const portable = new Release(portablePath)
    await run(portable)
  } else {
    console.warn(`The portable version does not exist: ${portablePath}`)
  }

  // Print results
  console.log(JSON.stringify(output, null, 2))
}


start()
