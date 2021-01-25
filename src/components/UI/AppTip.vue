<template>
  <span v-tooltip="tooltip" class="tip">
    <font-awesome-icon :icon="icon" />
  </span>
</template>

<script>
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
}
</script>

<style lang="scss" scoped>
.tip {
  @apply text-sm;
  cursor: help;
}
</style>
