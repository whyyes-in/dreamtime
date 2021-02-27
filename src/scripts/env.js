const { stringify } = require('envfile')
const fs = require('fs')
const { pickBy, identity, toString } = require('lodash')
const { choice } = require('@dreamnet/app')

// Normalize portable env
if (process.env.BUILD_PORTABLE) {
  const value = toString(process.env.BUILD_PORTABLE)

  if (value !== '1' && value !== 'true') {
    delete process.env.BUILD_PORTABLE
  }
}

// Default target ("target" on electron-builder)
if (!process.env.BUILD_TARGET || process.env.BUILD_TARGET === 'default') {
  if (process.env.BUILD_PORTABLE) {
    process.env.BUILD_TARGET = '7z'
  } else {
    process.env.BUILD_TARGET = choice({
      windows: 'nsis',
      linux: 'snap',
      macos: 'dmg',
    })
  }
}

// Release format
if (!process.env.BUILD_FORMAT) {
  process.env.BUILD_FORMAT = process.env.BUILD_TARGET

  if (!process.env.BUILD_PORTABLE && process.platform === 'win32') {
    // Windows installer is .exe not .nsis
    process.env.BUILD_FORMAT = 'exe'
  }
}

// Release arch
if (!process.env.BUILD_ARCH) {
  process.env.BUILD_ARCH = process.env.BUILD_PORTABLE ? 'portable' : 'installer'
}

// Release filename
if (!process.env.BUILD_FILENAME) {
  const osname = choice({
    windows: 'windows',
    linux: 'linux',
    macos: 'macos',
  })

  process.env.BUILD_FILENAME = `${process.env.npm_package_displayName}-v${process.env.npm_package_version}-${osname}-${process.env.BUILD_ARCH}.${process.env.BUILD_FORMAT}`
}

// Enviroment
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production'
}

const payload = pickBy({
  // Node
  NODE_ENV: process.env.NODE_ENV,

  // Servers
  DREAMTRACK_HOST: process.env.DREAMTRACK_HOST,
  DOWNLOADS_API: process.env.DOWNLOADS_API,

  // Build
  GITHUB_SHA: process.env.GITHUB_SHA,
  BUILD_PORTABLE: process.env.BUILD_PORTABLE,
  BUILD_TARGET: process.env.BUILD_TARGET,
  BUILD_FORMAT: process.env.BUILD_FORMAT,
  BUILD_ARCH: process.env.BUILD_ARCH,
  BUILD_FILENAME: process.env.BUILD_FILENAME,

  // package.json
  npm_package_displayName: process.env.npm_package_displayName,
  npm_package_version: process.env.npm_package_version,
  npm_package_description: process.env.npm_package_description,
}, identity)

// eslint-disable-next-line no-console
console.log(payload)

fs.writeFileSync('.env', stringify(payload))
