// DreamTime.
// Copyright (C) DreamNet. All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License 3.0 as published by
// the Free Software Foundation. See <https://www.gnu.org/licenses/gpl-3.0.html>
//
// Written by Ivan Bravo Bravo <ivan@dreamnet.tech>, 2019.

import { isNil, isString } from 'lodash'
import { spawn } from 'child_process'
import EventBus from 'js-event-bus'
import semverRegex from 'semver-regex'
import * as fs from 'fs-extra'
import { getPowerPath } from './paths'
import { settings } from '../settings'

const logger = require('@dreamnet/logplease').create('power')

let version

export function exec(args, options = {}) {
  args.push('--debug')

  if (settings.processing.usePython) {
    // python script
    args.unshift('main.py')

    logger.debug('[Python] Running:', {
      args,
      options,
    })

    // FIXME: Anaconda support.
    /*
    return spawn('C:\\Users\\koles\\Anaconda3\\envs\\dreampower\\python', args, {
      cwd: getPowerPath(),
      ...options,
    })
    */

    return spawn('python', args, {
      cwd: getPowerPath(),
      ...options,
    })
  }

  logger.debug('Running:', args)

  return spawn(getPowerPath('dreampower'), args, {
    cwd: getPowerPath(),
    ...options,
  })
}

/**
 *
 * @param {Array} args
 * @param {EventBus} events
 */
export async function nudify(args, events) {
  const process = exec(args)
  let cancelled = false

  process.on('error', (error) => {
    logger.error(error)
    events.emit('error', null, error)
  })

  process.stdout.on('data', (output) => {
    // logger.info(output.toString())
    const stdout = output.toString().trim().split('\n')
    events.emit('stdout', null, stdout)
  })

  process.stderr.on('data', (output) => {
    // logger.warn(output.toString())
    events.emit('stderr', null, output)
  })

  process.on('close', async (code) => {
    logger.info(`DreamPower exited with code ${code}`)
    events.emit('close', null, code)

    if (cancelled) {
      events.emit('cancelled')
    } else if (code === 0 || isNil(code)) {
      events.emit('success')
    } else {
      events.emit('fail', null)
    }
  })

  events.on('cancel', () => {
    cancelled = true
    process.stdin.pause()
    process.kill()
  })
}

/**
 *
 * @param {PhotoRun} run
 */
export const transform = (run) => {
  // Photo data
  const { preferences, photo } = run

  logger.debug(preferences)

  // input
  const inputFilepath = photo.finalFile.path

  // Steps
  let start = 0
  let end = 5

  // CLI Args
  const args = ['run', '--input', inputFilepath]

  if (run.isMaskGeneration) {
    //
    switch (run.mask) {
      case 'mask':
        // Corrected -> Mask
        start = 0
        end = 1
        break

      case 'maskref':
        start = 2
        end = 2
        break

      case 'maskdet':
        start = 3
        end = 3
        break

      case 'maskfin':
        start = 4
        end = 4
        break

      case 'nude':
      case 'overlay':
      default:
        start = 5
        end = 5
        break
    }
  } else {
    // Output
    args.push('--output', run.outputFile.path)
  }

  // Device
  if (settings.processing.device === 'CPU') {
    args.push('--cpu')
  } else {
    for (const id of settings.processing.gpus) {
      args.push('--gpu', id)
    }
  }

  args.push('--n-cores', settings.processing.cores)

  const { useColorTransfer, scaleMode } = preferences.advanced
  const { geometry } = photo

  if (scaleMode === 'overlay') {
    args.push(
      '--overlay',
      `${geometry.overlay.startX},${geometry.overlay.startY}:${geometry.overlay.endX},${geometry.overlay.endY}`,
    )

    /*
    end += 2

    if (start > 0) {
      start += 2
    }

    if (start === 5) {
      end += 1
    }
    */
  } else if (scaleMode !== 'none' && scaleMode !== 'cropjs' && scaleMode !== 'padding') {
    args.push(`--${scaleMode}`)

    /*
    end += 1

    if (start > 0) {
      start += 1
    }
    */
  }

  if (useColorTransfer) {
    args.push('--color-transfer')
  }

  // Advanced preferences
  if (start > 0) {
    // args.push('--ignore-size')
  }

  // Custom masks.
  if (run.isMaskGeneration) {
    args.push('--masks-path', photo.masksPath)
    args.push('--steps', `${start}:${end}`)
  }

  // body preferences
  args.push('--bsize', preferences.body.boobs.size)
  args.push('--asize', preferences.body.areola.size)
  args.push('--nsize', preferences.body.nipple.size)
  args.push('--vsize', preferences.body.vagina.size)
  args.push('--hsize', preferences.body.pubicHair.size)

  const events = new EventBus()

  nudify(args, events, run)

  return events
}

/**
 * @return {boolean}
 */
export function isInstalled() {
  const dirpath = getPowerPath()

  if (!isString(dirpath)) {
    // how the fuck?
    return false
  }

  if (!fs.existsSync(dirpath)) {
    return false
  }

  const binaries = [
    'main.py',
    'dreampower.exe',
    'dreampower',
  ]

  for (const bin of binaries) {
    if (fs.existsSync(getPowerPath(bin))) {
      return true
    }
  }

  return false
}

/**
 * @return {Promise}
 */
export const getVersion = () => new Promise((resolve, reject) => {
  if (version) {
    resolve(version)
    return
  }

  const process = exec(['--version'])

  let response = ''

  process.on('error', (error) => {
    logger.warn(error)
    reject(error)
  })

  process.stdout.on('data', (data) => {
    response += data
  })

  process.stderr.on('data', (data) => {
    response += data
  })

  process.on('close', (code) => {
    if (code === 0 || isNil(code)) {
      try {
        response = semverRegex().exec(response)
        response = `v${response[0]}`

        version = response
        resolve(response)
      } catch (err) {
        logger.warn(err)
        reject(err)
      }
    } else {
      reject(new Error(response))
    }
  })
})
