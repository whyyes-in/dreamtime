<template>
  <div v-if="canShow" class="notification" @click="$emit('click')">
    <span class="close-icon" @click="close()">
      <FontAwesomeIcon icon="times-circle" />
    </span>

    <slot />
  </div>
</template>

<script>
import { isNil } from 'lodash'

export default {
  props: {
    name: {
      type: String,
      required: true,
    },
  },

  data: () => ({
    closed: false,
  }),

  computed: {
    canShow() {
      if (!isNil(localStorage.getItem(`notification_${this.name}`))) {
        return false
      }

      return !this.closed
    },
  },

  methods: {
    close() {
      localStorage.setItem(`notification_${this.name}`, 'true')
      this.closed = true
    },
  },
}
</script>

<style lang="scss" scoped>
.notification {
  @apply relative;
}

.close-icon {
  @apply absolute text-lg cursor-pointer;
  top: 5px;
  right: 10px;
}
</style>
