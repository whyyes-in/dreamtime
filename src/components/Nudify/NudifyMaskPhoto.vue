<template>
  <div class="box mask">
    <div class="box__photo mask__photo" />

    <div class="box__header">
      <span class="title">{{ title }}</span>
    </div>

    <div class="box__footer buttons">
      <button class="button button--sm">
        <FontAwesomeIcon icon="undo" />
      </button>

      <button class="button button--sm">
        <FontAwesomeIcon icon="file-download" />
      </button>

      <button class="button button--primary button--sm">
        <FontAwesomeIcon icon="file-upload" />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    photo: {
      type: Object,
      required: true,
    },
    step: {
      type: String,
      required: true,
    },
  },

  computed: {
    title() {
      switch (this.step) {
        case 'correct':
          return 'Corrected'

        case 'mask':
          return 'Mask'

        case 'maskref':
          return 'Maskref'

        case 'maskdet':
          return 'Maskdet'

        case 'maskfin':
          return 'Maskfin'

        default:
          return this.step
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.mask__photo {
  background-image: url('~@/assets/images/curls.png');
  will-change: transform;
  height: 250px;
}
</style>
