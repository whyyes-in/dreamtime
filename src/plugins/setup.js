// DreamTime.
// Copyright (C) DreamNet. All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License 3.0 as published by
// the Free Software Foundation. See <https://www.gnu.org/licenses/gpl-3.0.html>
//
// Written by Ivan Bravo Bravo <ivan@dreamnet.tech>, 2019.

import Vue from 'vue'
import tippy from 'tippy.js'
import { Help } from '~/modules'
import { Consola } from '~/modules/consola'
import { achievements } from '~/modules/system'
import BaseMixin from '~/mixins/BaseMixin'
import { dream } from '~/modules'
import { Nudify, NudifyStore } from '~/modules/nudify'
import { settings } from '~/modules/system'

const consola = Consola.create('setup')

// lift off!
consola.info('Lift off!')

// base mixin.
Vue.mixin(BaseMixin)

// tippyjs
tippy.setDefaultProps({
  delay: [500, 0],
  arrow: true,
})

export default (ctx, inject) => {
  // User settings.
  ctx.app.$settings = settings
  inject('settings', settings)

  // DreamTime.
  ctx.app.$dream = dream
  inject('dream', dream)

  // Help system.
  Help.load()

  // Nudification/Queue.
  Nudify.setup()

  // Nudify store.
  NudifyStore.setup()
  inject('nudify', NudifyStore)

  // Achievements.
  achievements.setup()

  ctx.app.router.afterEach((to) => {
    console.log(to)

    /*
    if (to.path === '/games/badtime') {

    } else {

    }
    */
  })

  console.log(ctx)

  consola.info('The front-end is ready!')
}
