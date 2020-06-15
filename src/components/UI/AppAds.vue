<template>
  <div v-if="show" class="ads">
    <div v-if="showAd">
      <ins data-revive-zoneid="3" data-revive-id="7e048c7f8d85676181a4b65ec87d61fe" />
    </div>

    <HelpLesson v-if="showLesson"
                :lesson="lesson"
                :small="true"
                @click="$router.push('/help')" />
  </div>
</template>

<script>
import { isNil, sample } from 'lodash'
import { settings } from '~/modules/system'
import { Help } from '~/modules'

const CHANGE_INTERVAL = process.env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 15 * 60 * 1000

export default {
  data: () => ({
    type: null,
    ready: false,
    interval: null,
    lesson: null,
  }),

  computed: {
    show() {
      return !isNil(this.type)
    },

    isAd() {
      return this.type === 'ad'
    },

    showAd() {
      return this.isAd && this.ready
    },

    isLesson() {
      return this.type === 'lesson'
    },

    showLesson() {
      return this.isLesson && this.ready
    },
  },

  created() {
    this.init()
    this.interval = setInterval(this.init.bind(this), CHANGE_INTERVAL)
  },

  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  },

  methods: {
    init() {
      const types = []

      if (settings.app.showAds) {
        types.push('ad')
      }

      if (settings.app.showTips) {
        types.push('lesson')
      }

      if (types.length === 0) {
        this.type = null
      } else if (types.length === 1) {
        // eslint-disable-next-line prefer-destructuring
        this.type = types[0]
      } else {
        this.type = sample(types)
      }

      this.ready = false

      if (this.isAd) {
        this.refreshAd()
      } else if (this.isLesson) {
        this.refreshLesson()
      }
    },

    refreshAd() {
      if (!window.reviveAsync) {
        return
      }

      if (!window.reviveAsync['7e048c7f8d85676181a4b65ec87d61fe']) {
        return
      }

      this.$nextTick(() => {
        this.ready = true

        this.$nextTick(() => {
          window.reviveAsync['7e048c7f8d85676181a4b65ec87d61fe'].refresh()
        })
      })
    },

    refreshLesson() {
      this.lesson = Help.pickRandom()
      this.ready = true
    },
  },
}
</script>

<style lang="scss" scoped>
.ads {
  @apply border-t border-menus-light;

  &::v-deep .lesson {
    @apply rounded-none cursor-pointer;
    @include transition('background-color', 0.2s);

    &:hover {
      @apply bg-menus-light;
    }

    .box__photo {
      @apply rounded-none;
    }
  }
}
</style>
