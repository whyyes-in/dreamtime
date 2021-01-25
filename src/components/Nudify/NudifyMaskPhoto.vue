<template>
  <div class="box mask"
       :class="maskClass"
       @dragenter="onDragEnter"
       @dragover="onDragOver"
       @dragleave="onDragLeave"
       @drop="onDrop">
    <!-- Dragging -->
    <div class="mask__dropzone">
      <h2>Drop the {{ mask.title }} here!</h2>
    </div>

    <div class="box__photo mask__photo">
      <div v-if="file.exists"
           class="mask__photo__preview"
           :style="{ backgroundImage: `url('${file.url}')` }"
           data-private
           @click="openPreview" />
    </div>

    <div class="box__header">
      <span class="title">{{ mask.title }} <AppTip :tooltip="mask.description" /></span>
    </div>

    <input
      v-show="false"
      ref="photo"
      type="file"
      accept="image/png"
      @change="change">

    <div class="box__footer buttons">
      <!--
      <button v-if="mask.canShowEdit"
              key="edit"
              v-tooltip="'Edit with the photo editor.'"
              class="button button--sm">
        <FontAwesomeIcon icon="paint-brush" />
      </button>
      -->

      <button v-if="mask.canShowUpload"
              key="upload"
              v-tooltip="'Upload mask.'"
              class="button button--sm"
              @click="$refs.photo.click()">
        <FontAwesomeIcon icon="file-upload" />
      </button>

      <button v-if="mask.canShowSave"
              key="save"
              v-tooltip="'Save mask.'"
              class="button button--sm"
              @click="mask.save()">
        <FontAwesomeIcon icon="save" />
      </button>

      <button
        v-if="xRays && mask.canShowSave"
        key="button-transparency"
        v-tooltip="'X-Rays Tool'"
        class="button button--primary button--sm"
        @click="showTransparencyModal()">
        <span class="icon">
          <font-awesome-icon icon="spray-can" />
        </span>
      </button>

      <button v-if="mask.run"
              key="button-terminal"
              v-tooltip="'View terminal'"
              class="button button--sm"
              @click.prevent="$refs.terminalDialog.showModal()">
        <font-awesome-icon icon="terminal" />
      </button>

      <button v-if="mask.canShowGenerate && mask.photo.running"
              key="stop"
              v-tooltip="'Stop Generation.'"
              class="button button--danger button--sm"
              @click="stop()">
        <FontAwesomeIcon icon="stop" />
      </button>

      <button v-else-if="mask.canShowGenerate && mask.canShowSave"
              key="rerun"
              v-tooltip="'Rerun.'"
              class="button button--info button--sm"
              @click="generate()">
        <FontAwesomeIcon icon="retweet" />
      </button>

      <button v-else-if="mask.canShowGenerate && !mask.photo.running"
              key="play"
              v-tooltip="'Generate.'"
              class="button button--success button--sm"
              @click="generate()">
        <FontAwesomeIcon icon="play" />
      </button>

      <button v-else-if="mask.isReadOnly && mask.nextMask"
              key="play-disabled"
              v-tooltip="'This mask will be generated with the next.'"
              class="button button--success button--sm button--disabled">
        <FontAwesomeIcon icon="play" />
      </button>
    </div>

    <!-- Terminal Dialog -->
    <dialog v-if="mask.run" ref="terminalDialog">
      <div class="dialog__content">
        <div class="terminal">
          <li
            v-for="(item, index) in mask.run.cli.lines"
            :key="index"
            :class="item.css">
            > {{ item.text }}
          </li>
        </div>

        <div class="dialog__buttons">
          <button class="button button--danger" @click="$refs.terminalDialog.close()">
            Close
          </button>
        </div>
      </div>
    </dialog>

    <!-- Transparency Dialog -->
    <dialog ref="transparencyDialog">
      <div class="box">
        <div class="box__content">
          <canvas ref="transparencyCanvas"
                  class="transparency"
                  width="512"
                  height="512" />

          <MenuItem label="Transparency">
            <VueSlider v-model="transparency.alpha"
                       :min="0.05"
                       :max="0.95"
                       :interval="0.05" />
          </MenuItem>
        </div>

        <div class="box__footer box__footer--buttons">
          <button
            class="button button--success"
            @click.prevent="saveTransparency">
            <span class="icon">
              <font-awesome-icon icon="save" />
            </span>
            <span>Save</span>
          </button>

          <button class="button button--danger" @click="closeTransparencyModal">
            Close
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script>
import { debounce } from 'lodash'
import { File } from '~/modules'
import { DragDropMixin } from '~/mixins'
import { STEP } from '~/modules/nudify/photo-mask'

export default {
  mixins: [DragDropMixin],

  props: {
    mask: {
      type: Object,
      required: true,
    },
    xRays: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    renderPhoto: true,
    transparency: {
      alpha: 0.5,
      nude: undefined,
      corrected: undefined,
      canvas: undefined,
    },
  }),

  computed: {
    file() {
      return this.mask.file
    },

    run() {
      return this.mask.run
    },

    maskClass() {
      return {
        'mask--dragging': this.isDragging,
        'mask--failed': this.mask.run?.failed,
        'mask--running': this.mask.run?.running,
        'mask--finished': this.mask.run?.finished,
      }
    },
  },

  watch: {
    'transparency.alpha'() {
      this.onTransparencyChange()
    },
  },

  created() {
    this.onTransparencyChange = debounce(this.transparencyRefresh, 50, { leading: true })
  },

  mounted() {
    if (this.mask.isReadOnly) {
      this.isDragEnabled = false
    }

    this.file.on('loading', this.onLoadingPhoto, this)
    this.file.on('loaded', this.onLoadedPhoto, this)
  },

  beforeDestroy() {
    this.file.off('loading', this.onLoadingPhoto, this)
    this.file.off('loaded', this.onLoadedPhoto, this)
  },

  methods: {
    async change(event) {
      const { files } = event.target

      if (files.length === 0) {
        return
      }

      try {
        const file = await File.fromPath(files[0].path, { watch: false })

        file.validateAs('image/png')

        this.file.writeFile(file)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(error)
      }

      event.target.value = ''
    },

    async onURL(url) {
      try {
        const file = await File.fromUrl(url, { watch: false })

        file.validateAs('image/png')

        this.file.writeFile(file)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(error)
      }
    },

    async onFiles(files) {
      try {
        const file = await File.fromPath(files[0].path, { watch: false })

        file.validateAs('image/png')

        this.file.writeFile(file)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(error)
      }
    },

    generate() {
      this.mask.photo.generateMask(this.mask.id)
    },

    stop() {
      this.mask.photo.cancel()
    },

    openPreview() {
      this.mask.file.openItem()
    },

    onLoadingPhoto() {
      this.renderPhoto = false
    },

    onLoadedPhoto() {
      this.$nextTick(() => {
        this.renderPhoto = true
      })
    },

    showTransparencyModal() {
      this.transparencyRefresh()

      this.$refs.transparencyDialog.showModal()
    },

    closeTransparencyModal() {
      this.transparency.canvas = null
      this.transparency.nude = null
      this.transparency.corrected = null

      this.$refs.transparencyDialog.close()
    },

    async transparencyRefresh() {
      if (!this.file.exists) {
        throw new Warning('The fake nude has not been created.')
      }

      const canvas = this.$refs.transparencyCanvas

      if (!canvas) {
        throw new Warning('An internal problem has occurred, please try again.')
      }

      const context = canvas.getContext('2d')

      if (!context) {
        throw new Warning('An internal problem has occurred, please try again.')
      }

      this.transparency.canvas = canvas

      let correctedSrc = this.mask.photo.file.path

      if (this.mask.id === STEP.NUDE) {
        // Corrected
        correctedSrc = this.mask.photo.masks[STEP.CORRECT].file.path
      }

      if (!this.transparency.nude) {
        const nude = new Image()
        nude.src = `${this.file.path}?t=${Date.now()}`

        await new Promise((resolve) => {
          nude.onload = () => resolve()
        })

        this.transparency.nude = nude
      }

      if (!this.transparency.corrected) {
        const corrected = new Image()
        corrected.src = `${correctedSrc}?t=${Date.now()}`

        await new Promise((resolve) => {
          corrected.onload = () => resolve()
        })

        this.transparency.corrected = corrected
      }

      context.clearRect(0, 0, canvas.width, canvas.height)
      context.globalAlpha = 1.0
      context.drawImage(this.transparency.nude, 0, 0, canvas.width, canvas.height)
      context.globalAlpha = this.transparency.alpha
      context.drawImage(this.transparency.corrected, 0, 0, canvas.width, canvas.height)
    },

    saveTransparency() {
      this.transparency.canvas.toBlob((blob) => {
        saveAs(blob, this.run.outputName)
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.mask {
  @apply mb-0 relative border-2 border-transparent;

  &.mask--dragging {
    .mask__dropzone {
      @apply flex opacity-100;
    }
  }

  &.mask--running {
    @apply border-primary;
  }

  &.mask--failed {
    @apply border-danger;
  }
}

.mask__dropzone {
  @apply absolute left-0 right-0 top-0 bottom-0 z-50;
  @apply bg-menus-dark-80 items-center justify-center;
  @apply hidden opacity-0 pointer-events-none;
  backdrop-filter: blur(6px);
  transition: opacity 0.2s ease-in-out;
  will-change: opacity;

  h2 {
    @apply text-white font-bold text-xl;
  }
}

.mask__photo {
  background-image: url('~@/assets/images/cubes.png');
  will-change: transform;
  height: 350px;
}

.mask__photo__preview {
  @apply absolute top-0 bottom-0 left-0 right-0 z-10;
  @apply bg-contain bg-no-repeat bg-center;
  cursor: zoom-in;
}

.box__header {
  @apply pb-3;

  .tip {
    @apply ml-2;
  }
}

.buttons {
  @apply justify-end;

  .button {
    max-width: 90px;
  }
}

.terminal {
  @apply p-2 bg-black overflow-auto rounded;
  height: 400px;

  li {
    @apply font-mono text-xs text-common-light mb-3 block;

    &.text-danger {
      @apply text-danger-500;
    }
  }
}
</style>
