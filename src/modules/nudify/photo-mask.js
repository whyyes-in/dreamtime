export const STEP = {
  CORRECT: 'correct',
  MASK: 'mask',
  MASKREF: 'maskref',
  MASKDET: 'maskdet',
  MASKFIN: 'maskfin',
  NUDE: 'nude',
  OVERLAY: 'overlay',
  PADDING: 'padding',
  SCALE: 'scale',
}

const stepToFilename = {
  correct: 'DressToCorrect',
  mask: 'CorrectToMask',
  maskref: 'MaskToMaskref',
  maskdet: 'MaskrefToMaskdet',
  maskfin: 'MaskdetToMaskfin',
  nude: 'MaskfinToNude',
  overlay: 'ImageToOverlay',
  padding: 'ColorPaddingRemoval',
  scale: 'Upscale',
}

export class PhotoMask {
  id

  /**
   * @type {import('./photo').Photo}
   */
  photo

  /**
   * @type {import('./photo-run').PhotoRun}
   */
  run

  /**
   * @type {import('../file').File}
   */
  file

  get url() {
    return this.file.url
  }

  /**
   *
   * @type {boolean}
   * @readonly
   */
  get exists() {
    return this.file.exists
  }

  get isReadOnly() {
    if (this.id === STEP.CORRECT) {
      return true
    }

    if (this.id === STEP.NUDE && this.photo.scaleMode === 'overlay') {
      return true
    }

    return !this.nextMask
  }

  get nextMask() {
    const { scaleMode, useColorPaddingRemoval } = this.photo
    const { waifu } = this.photo.preferences.advanced

    switch (this.id) {
      case STEP.CORRECT:
        return STEP.MASK

      case STEP.MASK:
        return STEP.MASKREF

      case STEP.MASKREF:
        return STEP.MASKDET

      case STEP.MASKDET:
        return STEP.MASKFIN

      case STEP.MASKFIN:
        return STEP.NUDE

      case STEP.NUDE:
        if (scaleMode === 'overlay') {
          return STEP.OVERLAY
        } if (useColorPaddingRemoval) {
          return STEP.PADDING
        } if (waifu.enabled) {
          return STEP.SCALE
        }

        return null

      case STEP.OVERLAY:
      case STEP.PADDING:
        return waifu.enabled ? STEP.SCALE : null

      default:
        return null
    }
  }

  get canShowRestore() {
    return this.exists && !this.isReadOnly
  }

  get canShowEdit() {
    return this.exists && !this.isReadOnly
  }

  get canShowSave() {
    return this.exists
  }

  get canShowUpload() {
    return !this.isReadOnly
  }

  get canShowGenerate() {
    const { scaleMode, useColorPaddingRemoval } = this.photo

    switch (this.id) {
      case STEP.CORRECT:
        return false

      case STEP.MASK:
        return true

      case STEP.MASKREF:
        return this.photo.masks.correct.file.exists && this.photo.masks.mask.file.exists

      case STEP.MASKDET:
        return this.photo.masks.maskref.exists

      case STEP.MASKFIN:
        return this.photo.masks.maskdet.exists

      case STEP.NUDE:
        if (scaleMode === 'overlay') {
          return false
        }

        return this.photo.masks.maskfin.exists

      case STEP.OVERLAY:
        return this.photo.masks.maskfin.exists

      case STEP.PADDING:
        return this.photo.masks.nude.exists

      case STEP.SCALE:
        if (scaleMode === 'overlay') {
          return this.photo.masks.overlay.exists
        } if (useColorPaddingRemoval) {
          return this.photo.masks.padding.exists
        }

        return this.photo.masks.nude.exists

      default:
        return !this.isReadOnly
    }
  }

  get title() {
    switch (this.id) {
      case STEP.CORRECT:
        return 'Corrected'

      case STEP.MASK:
        return 'Maskcloth'

      case STEP.MASKREF:
        return 'Maskref'

      case STEP.MASKDET:
        return 'Maskdet'

      case STEP.MASKFIN:
        return 'Maskfin'

      case STEP.NUDE:
        return 'Nude'

      case STEP.OVERLAY:
        return 'Overlay'

      case STEP.PADDING:
        return 'Color Padding Removal'

      case STEP.SCALE:
        return 'Upscale & Denoise'

      default:
        return this.id
    }
  }

  get description() {
    switch (this.id) {
      case STEP.CORRECT:
        return '[OPENCV] The algorithm applies color correction to the photo to understand it more easily.<br><br><strong>NOTE:</strong> Scale and editor changes are applied here.'

      case STEP.MASK:
        return '[GAN] The algorithm recognizes and marks the clothes to be removed.'

      case STEP.MASKREF:
        return '[OPENCV] Correction of errors in the Maskcloth.'

      case STEP.MASKDET:
        return '[GAN] The algorithm recognizes and marks the ideal position and size of the body parts.<br><br><strong>This is the most important mask!</strong>'

      case STEP.MASKFIN:
        return '[OPENCV] Correction of errors and scale of the body parts according to the preferences.<br><br><strong>NOTE:</strong> This mask needs a valid Maskref and Maskdet to generate.'

      case STEP.NUDE:
        return '[GAN] The algorithm generates the fake nude.'

      case STEP.OVERLAY:
        return '[DREAMPOWER] The nudified part of the photo is restored in the original photo.'

      case STEP.PADDING:
        return '[DREAMTIME] Automatic removal of the color padding mask.'

      case STEP.SCALE:
        return '[DREAMTIME] The Waifu2X algorithm upscale and denoise the nude.'

      default:
        return this.id
    }
  }

  constructor(id, photo) {
    this.id = id
    this.photo = photo

    this.file = photo.createFile(stepToFilename[id], {
      deleteIfExists: true,
    })
  }

  save() {
    this.file.save()
  }
}
