<template>
  <div v-if="canShow"
       class="notification"
       :class="style"
       @click="click">
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
    color: {
      type: String,
      default: null,
    },
  },

  data: () => ({
    closed: false,
  }),

  computed: {
    canShow() {
      if (!this.name) {
        return false
      }

      if (!isNil(localStorage.getItem(`notification_${this.name}`))) {
        return false
      }

      return !this.closed
    },

    style() {
      if (!this.color) {
        return {}
      }

      return {
        [`notification--${this.color}`]: true,
      }
    },
  },

  methods: {
    click(e) {
      if (e.target.nodeName !== 'DIV' && e.target.nodeName !== 'STRONG') {
        return
      }

      this.$emit('click')
    },

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

  &:hover {
    @apply text-danger;
  }
}
</style>
