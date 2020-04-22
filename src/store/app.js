/* eslint-disable no-shadow */

export const state = () => ({
  isBadTime: false,
})

export const mutations = {
  badTimeEnter(state) {
    state.isBadTime = true
  },

  badTimeOut(state) {
    state.isBadTime = false
  },
}
