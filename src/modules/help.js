import { sample } from 'lodash'
import lessons from './config/help.yml'

export const Help = {
  lessons,

  pickRandom() {
    return sample(this.lessons)
  },
}
