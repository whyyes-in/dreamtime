<template>
  <div class="badtime">
    <!-- Menu -->
    <portal to="menu">
      <section class="menu__items">
        <menu-item
          label="UNDERTALE"
          icon="globe"
          href="https://undertale.com/" />

        <menu-item
          label="Buy on Steam"
          :icon="['fab', 'steam']"
          href="https://store.steampowered.com/app/391540" />

        <menu-item
          label="Open in Browser"
          icon="external-link-alt"
          href="https://badtime.dreamnet.tech" />
      </section>
    </portal>

    <iframe
      id="badtime"
      src="https://badtime.dreamnet.tech"
      name="badtime"
      scrolling="no"
      frameborder="0"
      marginheight="0px"
      marginwidth="0px"
      sandbox="allow-scripts allow-same-origin" />
  </div>
</template>

<script>
import { events, tutorial } from '~/modules'

export default {
  layout: 'layout--fullscreen',

  mounted() {
    this.unlock()
    consola.track('BADTIME_PLAY')
  },

  methods: {
    unlock() {
      tutorial.badtime()
      events.emit('achievements.badtime')
    },
  },
}
</script>

<style lang="scss" scoped>
.badtime {
  @apply h-full;

  iframe {
    @apply border-none w-full h-full;
  }
}
</style>
