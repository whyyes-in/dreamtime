<template>
  <div class="preview" :style="photoURL" data-private>
    <NudifyPhotoBadge v-if="badge" :photo="photo" />
  </div>
</template>

<script>
export default {
  props: {
    photo: {
      type: Object,
      required: true,
    },

    badge: {
      type: Boolean,
      default: true,
    },

    live: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    photoURL() {
      let { file } = this.photo

      if (this.live && this.photo.finished && this.photo.runs.length > 0) {
        const [run] = this.photo.runs

        if (run.outputFile && run.outputFile.exists) {
          file = run.outputFile
        }
      }

      return {
        backgroundImage: `url("${file.url}")`,
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.preview {
  @apply absolute top-0 bottom-0 left-0 right-0 z-10;
  @apply bg-contain bg-no-repeat bg-center;
}

.badge {
  @apply absolute z-20;
  top: 5px;
  right: 5px;
  width: 30px;
  height: 30px;
}
</style>
