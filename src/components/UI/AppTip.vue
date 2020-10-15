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
@keyframes tipAnim {
  0% {
    @apply text-common-light;
  }

  50% {
    @apply text-primary;
  }

  100% {
    @apply text-common-light;
  }
}

.tip {
  cursor: help;

  animation-name: tipAnim;
  animation-timing-function: ease-in-out;
  animation-duration: 30s;
  animation-iteration-count: infinite;
}
</style>
