<template>
  <div v-tooltip="theTooltip" class="tip">
    <font-awesome-icon :icon="icon" />
  </div>
</template>

<script>
import { isString, merge } from 'lodash'

export default {
  props: {
    icon: {
      type: [String, Object],
      default: 'question-circle',
    },
    tooltip: {
      type: [String, Object],
      required: true,
    },
  },

  computed: {
    theTooltip() {
      if (isString(this.tooltip)) {
        return { appendTo: 'parent', content: this.tooltip }
      }

      return merge(this.tooltip, { appendTo: 'parent' })
    },
  },
}
</script>

<style lang="scss" scoped>
.tip {
  @apply inline-block text-sm;
  cursor: help;
}
</style>
