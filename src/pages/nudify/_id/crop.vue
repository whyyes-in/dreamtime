<template>
  <div class="cropper">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="crop" /></span>
        <span>Crop tool.</span>
      </h2>

      <h3 class="subtitle">
        Manually select the area you want to be cropped and resized.
        <AppTip :tooltip="tooltip" />
      </h3>

      <template #right>
        <button id="cropper-reload"
                v-tooltip="'Get recent changes from the editor.'"
                class="button"
                @click.prevent="reload">
          <span class="icon"><font-awesome-icon icon="sync" /></span>
          <span>Reload</span>
        </button>
      </template>
    </PageHeader>

    <div class="cropper__crop">
      <canvas ref="cropCanvas" data-private />
    </div>
  </div>
</template>

<script>
import { tutorial } from '~/modules'

export default {
  layout: 'layout--wide',

  computed: {
    tooltip() {
      return `Commands:<br>
      - Increase or decrease the zoom with the mouse wheel.<br>
      - Click and drag somewhere in the photo to create the crop box.<br>
      - You can move the crop box by dragging it.<br>
      - You can increase or decrease the size of the cropbox by dragging any of the anchor points in the corners.<br><br>

      <strong>Warning:</strong> This tool can dramatically decrease the quality of some photos.`
    },

    photo() {
      return this.$parent.photo
    },

    cropper() {
      return this.photo.cropper
    },
  },

  mounted() {
    this.create()
    tutorial.cropper()
  },

  methods: {
    /**
     *
     */
    async create() {
      const Cropper = require('cropperjs')

      const canvas = this.$refs.cropCanvas

      this.photo.cropper = new Cropper(canvas, {
        aspectRatio: 1,
        wheelZoomRatio: 0.05,
        ready: () => {
          const { cropper } = this.photo

          this.photo.geometry.crop = cropper.getData()
          this.photo.geometry.image = cropper.getImageData()

          cropper.setCropBoxData(this.photo.geometry.cropBox)

          canvas.addEventListener('crop', () => {
            this.photo.geometry.cropBox = cropper.getCropBoxData()
            this.photo.geometry.crop = cropper.getData()
          })
        },
      })

      this.reload()
    },

    /**
     *
     */
    async reload() {
      await this.photo.syncEditor()
      this.cropper.replace(this.photo.inputFile.url)
    },
  },
}
</script>

<style lang="scss" scoped>
.cropper {
  @apply flex flex-col h-full;
}

.cropper__crop {
  @apply flex-1 h-full;
}
</style>
