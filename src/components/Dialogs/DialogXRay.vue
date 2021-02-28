<template>
  <dialog ref="dialog" class="dialog">
    <AppBox>
      <canvas ref="canvas" width="512" height="512" />

      <MenuItem label="Transparency">
        <VueSlider v-model="alpha"
                   :min="0.025"
                   :max="0.975"
                   :interval="0.025" />
      </MenuItem>

      <template #footer>
        <div class="box__footer buttons">
          <button class="button button--success" @click="save">
            <span class="icon"><font-awesome-icon icon="save" /></span>
            <span>Save</span>
          </button>

          <button class="button button--danger" @click="close">
            Close
          </button>
        </div>
      </template>
    </AppBox>
  </dialog>
</template>

<script>
import { saveAs } from 'file-saver'
import { File } from '~/modules'

export default {
  props: {
    clothFile: {
      type: File,
      required: true,
    },
    nudeFile: {
      type: File,
      required: true,
    },
    outputName: {
      type: String,
      default: null,
    },
    imageSize: {
      type: Number,
      default: 512,
    },
  },

  data: () => ({
    context: null,
    nudeImg: null,
    clothImg: null,
    alpha: 0.5,
  }),

  watch: {
    alpha() {
      this.update()
    },
  },

  mounted() {
    if (!this.$refs.canvas) {
      throw new Warning('X-Ray editor canvas not found.')
    }

    this.context = this.$refs.canvas.getContext('2d')

    if (!this.context) {
      throw new Warning('X-Ray editor context not found.')
    }
  },

  methods: {
    open() {
      if (!this.clothFile.exists) {
        throw new Warning('The photo with clothes does not exist.')
      }

      if (!this.nudeFile.exists) {
        throw new Warning('The photo with clothes does not exist.')
      }

      this.update()

      this.$refs.dialog.showModal()
    },

    close() {
      this.$refs.dialog.close()

      this.clothImg = null
      this.nudeImg = null
    },

    save() {
      let { canvas } = this.$refs

      if (this.imageSize !== 512) {
        canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        canvas.width = this.imageSize
        canvas.height = this.imageSize

        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = 'high'

        context.clearRect(0, 0, canvas.width, canvas.height)
        context.globalAlpha = 1.0
        context.drawImage(this.nudeImg, 0, 0, canvas.width, canvas.height)
        context.globalAlpha = this.alpha
        context.drawImage(this.clothImg, 0, 0, canvas.width, canvas.height)
      }

      canvas.toBlob((blob) => {
        saveAs(blob, this.outputName || 'xray.png')
      })
    },

    update() {
      if (!this.nudeImg) {
        const image = new Image()
        image.src = this.nudeFile.url
        this.nudeImg = image
      }

      if (!this.clothImg) {
        const image = new Image()
        image.src = this.clothFile.url
        this.clothImg = image
      }

      const { canvas } = this.$refs

      this.context.imageSmoothingEnabled = true
      this.context.imageSmoothingQuality = 'high'

      this.context.clearRect(0, 0, canvas.width, canvas.height)
      this.context.globalAlpha = 1.0
      this.context.drawImage(this.nudeImg, 0, 0, canvas.width, canvas.height)
      this.context.globalAlpha = this.alpha
      this.context.drawImage(this.clothImg, 0, 0, canvas.width, canvas.height)
    },
  },
}
</script>

<style lang="scss" scoped>
.dialog {
  @apply justify-center items-center top-0 bottom-0;

  &[open] {
    @apply flex;
  }
}

canvas {
  @apply mb-6;
}
</style>
