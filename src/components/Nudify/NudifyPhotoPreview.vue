<template>
  <div class="preview" :style="photoURL" data-private>
    <video v-if="isVideo"
           :src="file.url"
           :autoplay="autoplay"
           muted
           loop />

    <NudifyPhotoBadge v-if="badge && $settings.app.duplicates" :photo="photo" />
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

    autoplay: {
      type: Boolean,
      default: true,
    },
  },

  computed: {
    isVideo() {
      return this.photo.file.isVideo
    },

    file() {
      return this.live ? this.photo.previewFile : this.photo.file
    },

    photoURL() {
      if (this.isVideo) {
        return {}
      }

      return {
        backgroundImage: `url("${this.file.url}")`,
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.preview {
  @apply absolute top-0 bottom-0 left-0 right-0 z-10;
  @apply bg-contain bg-no-repeat bg-center;

  video {
    @apply h-full w-full overflow-hidden;
  }
}

.badge {
  @apply absolute z-20;
  top: 5px;
  right: 5px;
  width: 30px;
  height: 30px;
}
</style>
