/* eslint-disable no-shadow */
import { isString } from 'lodash'

export const state = () => ({
  isBadTime: false,
  layoutClass: {},
})

export const mutations = {
  badTimeEnter(state) {
    state.isBadTime = true
  },

  badTimeOut(state) {
    state.isBadTime = false
  },

  setLayoutClass(state, value) {
    if (isString(value)) {
      const name = value

      value = {}
      value[name] = true
    }

    state.layoutClass = value
  },

  clearLayoutClass(state) {
    state.layoutClass = {}
  },
}
