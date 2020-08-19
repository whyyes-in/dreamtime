/* eslint-disable no-underscore-dangle */
import fs from 'fs'
import { initializeImageMagick, ImageMagick as ImageMagickWASM } from '@imagemagick/magick-wasm'
import { _withString } from '@imagemagick/magick-wasm/native/string'
import { Exception } from '@imagemagick/magick-wasm/exception/exception'
import { MagickFormat } from '@imagemagick/magick-wasm/magick-format'
import { MagickImage } from '@imagemagick/magick-wasm/magick-image'

/**
 * @typedef {object} Geometry
 * @property {number} Geometry.width
 * @property {number} Geometry.height
 * @property {number} Geometry.x
 * @property {number} Geometry.y
*/

let initialized = false

async function initialize() {
  if (initialized) {
    return
  }

  await initializeImageMagick()

  initialized = true
}

export class ImageMagick {
  /**
   * @type {import('./file').File}
   *
   */
  file

  /**
   * @type {import('@imagemagick/magick-wasm/magick-image').MagickImage}
   *
   */
  image

  /**
   * Creates an instance of ImageMagick.
   * @param {import('./file').File} file
   */
  constructor(file) {
    this.file = file
  }

  async init() {
    if (this.image) {
      return
    }

    await initialize()

    const image = new MagickImage()
    const data = fs.readFileSync(this.file.path, null)

    image.read(data)

    this.image = image
  }

  /**
   *
   *
   * @param {Geometry} geometry
   */
  async crop(geometry) {
    await this.init()

    await new Promise((resolve) => {
      Exception.use((exception) => {
        _withString(`${geometry.width}x${geometry.height}+${geometry.x}+${geometry.y}!`, (geometryPtr) => {
          ImageMagickWASM._api._MagickImage_BackgroundColor_Set(this.image._instance, 'white')
          const newImage = ImageMagickWASM._api._MagickImage_Crop(this.image._instance, geometryPtr, exception.ptr)
          this.image._setInstance(newImage, exception)
          resolve()
        })
      })
    })

    return this
  }

  async blur(radius, sigma) {
    await this.init()

    this.image.blur(radius, sigma)

    return this
  }

  /**
   *
   *
   * @param {number} width
   * @param {number} height
   */
  async resize(width, height) {
    await this.init()
    this.image.resize(width, height)
  }

  /**
   *
   *
   * @param {import('./file').File} [destFile]
   */
  async write(destFile) {
    await this.init()

    if (!destFile) {
      destFile = this.file
    }

    await new Promise((resolve) => {
      this.image.write((data) => {
        destFile.write(data)
        resolve()
      }, MagickFormat.Png)
    })
  }

  async getDataURL() {
    await this.init()

    return new Promise((resolve) => {
      this.image.write((data) => {
        const b64encoded = Buffer.from(data).toString('base64')
        resolve(b64encoded)
      }, MagickFormat.Png)
    })
  }
}
