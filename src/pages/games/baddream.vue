<template>
  <div class="baddream">
    <!-- Menu -->
    <portal to="menu">
      <section class="menu__items">
        <menu-item
          label="Hylics 2"
          icon="globe"
          href="https://mason-lindroth.itch.io/hylics-2" />

        <menu-item
          label="Buy on Steam"
          :icon="['fab', 'steam']"
          href="https://store.steampowered.com/app/1286710" />

        <menu-item
          label="Open in Browser"
          icon="external-link-alt" />
      </section>
    </portal>

    <img src="https://img.itch.zone/aW1hZ2UvNjI5NDM0LzMzNTgxNzgucG5n/original/XD%2Fi%2Fa.png">
  </div>
</template>

<script>
// import { events, tutorial } from '~/modules'

export default {
  layout: 'layout--fullscreen',

  mounted() {
    this.unlock()
    // tutorial.badtime()
  },

  methods: {
    unlock() {
      // tutorial.badtime()
      // events.emit('achievements.badtime')
    },
  },
}
</script>

<style lang="scss" scoped>
.baddream {
  @apply h-full;

  iframe {
    @apply border-none w-full h-full;
  }
}
</style>
