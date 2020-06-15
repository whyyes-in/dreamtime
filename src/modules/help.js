import { sample } from 'lodash'
import lessons from './config/help.yml'

export const Help = {
  lessons,

  async load() {

  },

  pickRandom() {
    return sample(this.lessons)
  },
}
