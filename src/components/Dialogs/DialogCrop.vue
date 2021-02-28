<template>
  <dialog ref="dialog" class="dialog" :class="style">
    <AppBox>
      <!-- Needed for canvas width/height -->
      <div class="cropper">
        <canvas ref="canvas" data-private />
      </div>

      <template #footer>
        <div class="box__footer buttons">
          <button class="button flex-1 button--success" @click="apply">
            <span>Apply</span>
          </button>

          <button class="button flex-1 button--danger" @click="dismiss">
            Dismiss
          </button>
        </div>
      </template>
    </AppBox>
  </dialog>
</template>

<script>
import Cropper from 'cropperjs'
import Jimp from 'jimp'
import { round } from 'lodash'
import PaddingMaskImage from '~/assets/images/masks/1.jpg'
import { events } from '~/modules'
import { Photo } from '~/modules/nudify/photo'

export default {
  props: {
    photo: {
      type: Photo,
      required: true,
    },
    type: {
      type: String,
      default: 'crop',
    },
    watch: {
      type: Boolean,
      default: true,
    },
  },

  data: () => ({
    cropper: null,
    used: false,

    // Data to restore the crop position (if applied).
    cropBoxData: null,
    canvasData: null,
  }),

  computed: {
    file() {
      return this.photo.files.editor
    },
    outputFile() {
      return this.photo.files.crop
    },
    style() {
      return `dialog--${this.type}`
    },
  },

  watch: {
    'photo.preferences.advanced.scaleMode'(current) {
      if (!this.used) {
        return
      }

      if (current === 'cropjs' || current === 'overlay' || current === 'padding') {
        this.reApply()
      }
    },

    'photo.preferences.advanced.imageSize'() {
      this.reApply()
    },
  },

  mounted() {
    if (this.watch) {
      this.file.on('loaded', this.onLoaded.bind(this))
    }

    events.on('photo.editor.apply', this.reApply.bind(this))
  },

  beforeDestroy() {
    if (this.watch) {
      this.file.off('loaded', this.onLoaded.bind(this))
    }

    events.off('photo.editor.apply', this.reApply.bind(this))
  },

  methods: {
    onLoaded() {
      if (this.cropper) {
        if (this.type === 'color') {
          this.cropper.replace(PaddingMaskImage)
        } else {
          this.cropper.replace(this.file.url)
        }
      }
    },

    create() {
      return new Promise((resolve) => {
        const { crop } = this.photo

        // Restore crop position
        this.cropBoxData = crop.cropBoxData
        this.canvasData = crop.canvasData

        const settings = {
          viewMode: 0,
          aspectRatio: 1,
          wheelZoomRatio: 0.05,
          ready: () => {
            if (this.canvasData) {
              this.cropper.setCanvasData(this.canvasData)
            }

            if (this.cropBoxData) {
              this.cropper.setCropBoxData(this.cropBoxData)
            }

            resolve()
          },
          cropend: () => {
            this.cropBoxData = this.cropper.getCropBoxData()
            this.canvasData = this.cropper.getCanvasData()
          },
        }

        if (this.type === 'overlay') {
          settings.viewMode = 1
        }

        if (this.type === 'color') {
          settings.viewMode = 1
          settings.autoCropArea = 1
          settings.zoomable = false
          settings.initialAspectRatio = 0.9
        }

        this.destroy()

        this.cropper = new Cropper(this.$refs.canvas, settings)

        if (this.type === 'color') {
          this.cropper.replace(PaddingMaskImage)
        } else {
          this.cropper.replace(this.file.url)
        }
      })
    },

    open() {
      this.$refs.dialog.showModal()

      if (this.type === 'color') {
        document.documentElement.style.setProperty('--photo-image', `url("${this.file.url}")`)
      }

      return this.create()
    },

    dismiss() {
      this.$refs.dialog.close()
      this.destroy()
    },

    destroy() {
      if (this.cropper) {
        this.cropper.destroy()
        this.cropper = null
      }
    },

    async apply() {
      const cropData = this.cropper.getData()

      /* eslint-disable vue/no-mutating-props */
      this.photo.crop = {
        cropData,
        cropBoxData: this.cropBoxData,
        canvasData: this.canvasData,
        overlayData: {
          startX: round(cropData.x),
          startY: round(cropData.y),
          endX: round(cropData.x) + round(cropData.width),
          endY: round(cropData.y) + round(cropData.height),
        },
      }

      if (this.type === 'crop' || this.type === 'overlay') {
        try {
          await this.jimpCrop()
        } catch (e) {
          await this.crop()
        }
      }

      if (this.type === 'color') {
        await this.colorCrop()
      }

      this.$emit('apply')
      this.used = true

      this.$refs.dialog.close()
      this.destroy()
    },

    async crop() {
      const { imageSize } = this.photo

      const canvas = this.cropper.getCroppedCanvas({
        width: imageSize,
        height: imageSize,
        fillColor: 'white',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      })

      const dataURL = canvas.toDataURL(this.file.mimetype, 1)

      await this.outputFile.writeDataURL(dataURL)
    },

    async jimpCrop() {
      const { imageSize } = this.photo
      const cropData = this.cropper.getData()

      const image = await Jimp.read(this.file.path)

      image.crop(
        cropData.x,
        cropData.y,
        cropData.width,
        cropData.height,
      ).resize(imageSize, imageSize)

      await image.writeAsync(this.outputFile.path)
    },

    async colorCrop() {
      const { imageSize } = this.photo
      const cropData = this.cropper.getData()

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      const mask = new Image()
      const image = new Image()

      canvas.width = imageSize
      canvas.height = imageSize

      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'

      await Promise.all([
        new Promise((resolve) => {
          image.onload = () => {
            resolve()
          }

          image.src = this.file.url
        }),
        new Promise((resolve) => {
          mask.onload = () => {
            resolve()
          }

          mask.src = PaddingMaskImage
        }),
      ])

      // The color padding image is 512x512
      // so we need this cheap scale hack.
      const scale = imageSize / 512

      context.drawImage(mask, 0, 0, canvas.width, canvas.height)
      context.drawImage(image, cropData.x * scale, cropData.y * scale, cropData.width * scale, cropData.height * scale)

      const dataURL = canvas.toDataURL(this.file.mimetype, 1)

      await this.outputFile.writeDataURL(dataURL)
    },

    async reApply() {
      await this.open()
      await this.apply()
    },
  },
}
</script>

<style lang="scss" scoped>
.dialog {
  @apply justify-center items-center top-0 bottom-0;
  max-width: 100vw;

  &[open] {
    @apply flex;
  }

  &::v-deep {
    .box {
      width: 95vw;
      height: 95vh;
    }

    .cropper {
      @apply h-full;
    }
  }
}

.dialog--color {
  &::v-deep {
    .cropper-view-box,
    .cropper-face {
      @apply bg-black bg-no-repeat opacity-100;
      background-image: var(--photo-image, url('~assets/images/etc/MvlZgXx.jpg'));
      background-size: 100% 100%;
    }
  }
}
</style>
