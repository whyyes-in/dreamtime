<template>
  <div v-if="$dreamtrack.enabled" class="stats">
    <div v-tippy
         data-tippy-content="Users like you who are using the application right now!"
         data-tippy-placement="bottom"
         class="box">
      <span class="stats__value">{{ stats | stat('users.realtime') }}</span>
      <span class="stats__label">real-time users</span>
    </div>

    <div v-tippy
         data-tippy-content="Number of unique users who have used the application."
         data-tippy-placement="bottom"
         class="box">
      <span class="stats__value">{{ stats | stat('users.total') }}</span>
      <span class="stats__label">users</span>
    </div>

    <div v-tippy
         data-tippy-content="Number of times the application has been opened."
         data-tippy-placement="bottom"
         class="box">
      <span class="stats__value">{{ stats | stat('sessions.total') }}</span>
      <span class="stats__label">sessions</span>
    </div>

    <div v-tippy
         data-tippy-content="Number of photos that have been nudified."
         data-tippy-placement="bottom"
         class="box">
      <span class="stats__value">{{ stats | stat('events.total.DREAM_COMPLETED') }}</span>
      <span class="stats__label">nudifications</span>
    </div>
  </div>
</template>

<script>
import { get } from 'lodash'

export default {
  filters: {
    stat(value, key) {
      value = get(value, key, 0)
      return new Intl.NumberFormat('en-us', { }).format(value)
    },
  },

  data: () => ({
    channel: null,
    stats: {},
  }),

  created() {
    this.init()
  },

  beforeDestroy() {
    this.shutdown()
  },

  methods: {
    init() {
      if (!this.$dreamtrack.enabled) {
        return
      }

      this.channel = this.$dreamtrack.service.subscribe('dreamtime:stats')

      this.channel.on('data', (payload) => {
        this.stats = payload
      })
    },

    shutdown() {
      if (!this.channel) {
        return
      }

      this.channel.close()
      this.channel = null
    },
  },
}
</script>

<style lang="scss" scoped>
.stats {
  @apply grid grid-cols-4 gap-3;
  @apply mb-9;
}

.box {
  @apply mb-0 items-center px-3 py-6;
}

.stats__value {
  @apply text-lg text-white font-bold;
}

.stats__label {
  @apply text-sm;
}
</style>
