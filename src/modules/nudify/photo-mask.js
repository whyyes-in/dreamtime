export const STEP = {
  CORRECT: 'correct',
  MASK: 'mask',
  MASKREF: 'maskref',
  MASKDET: 'maskdet',
  MASKFIN: 'maskfin',
}

const stepToFilename = {
  correct: 'DressToCorrect',
  mask: 'CorrectToMask',
  maskref: 'MaskToMaskref',
  maskdet: 'MaskrefToMaskdet',
  maskfin: 'MaskdetToMaskfin',
}


export class PhotoMask {
  id

  /**
   * @type {Photo}
   */
  photo

  /**
   * @type {File}
   */
  file

  constructor(id, photo) {
    this.id = id
    this.photo = photo
  }
}
