<template>
  <div class="cropper">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="compress-arrows-alt" /></span>
        <span>Color Padding tool.</span>
      </h2>

      <h3 class="subtitle">
        Adjust the photo to the color padding mask.
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
import PaddingMask from '~/assets/images/masks/1.jpg'

export default {
  layout: 'layout--wide',

  computed: {
    tooltip() {
      return `
      Make sure that the black and white colors are visible on the sides of the photo, by doing this correctly the algorithm will dramatically decrease the color change that occurs during nudification.<br><br>

      Commands:<br>
      - Click and drag somewhere in the mask to create the photo.<br>
      - You can move the photo by dragging it.<br>
      - You can increase or decrease the size of the photo by dragging any of the anchor points in the corners.<br><br>

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
        viewMode: 1,
        initialAspectRatio: 0.9,
        autoCropArea: 1,
        zoomable: false,
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

      this.photo.cropper.replace(PaddingMask)

      this.reload()
    },

    /**
     *
     */
    async reload() {
      await this.photo.syncEditor()

      const root = document.documentElement
      root.style.setProperty('--photo-image', `url("${this.photo.inputFile.path}")`)
    },
  },
}
</script>

<style lang="scss" scoped>
.cropper {
  @apply flex flex-col h-full;

  &::v-deep {
    .cropper-view-box,
    .cropper-face {
      @apply bg-black bg-no-repeat opacity-100;
      background-image: var(--photo-image, url('~assets/images/etc/MvlZgXx.jpg'));
      background-size: 100% 100%;
    }
  }
}

.cropper__crop {
  @apply flex-1 h-full;
}
</style>
