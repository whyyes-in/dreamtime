/* eslint-disable no-shadow */
import { isString } from 'lodash'

export const state = () => ({
  isBadTime: false,
  dragDropEnabled: true,
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

  setDragDropEnabled(state, value) {
    state.dragDropEnabled = value
  },
}
