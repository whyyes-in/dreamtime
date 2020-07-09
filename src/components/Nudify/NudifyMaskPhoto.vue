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

    <div class="box__photo mask__photo" data-private>
      <div v-if="file.exists"
           class="mask__photo__preview"
           :style="{ backgroundImage: `url('${file.url}')` }"
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
              class="button button--sm button--info"
              @click="mask.save()">
        <FontAwesomeIcon icon="save" />
      </button>

      <button v-if="mask.canShowGenerate"
              key="play"
              v-tooltip="'Generate.'"
              class="button button--success button--sm"
              @click="generate()">
        <FontAwesomeIcon icon="play" />
      </button>
    </div>
  </div>
</template>

<script>
import { File } from '~/modules'
import { DragDropMixin } from '~/mixins'

export default {
  mixins: [DragDropMixin],

  props: {
    mask: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    renderPhoto: true,
  }),

  computed: {
    file() {
      return this.mask.file
    },

    maskClass() {
      return {
        'mask--dragging': this.isDragging,
      }
    },
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

      const file = await File.fromPath(files[0].path, { watch: false })

      file.validateAs('image/png')

      this.file.writeFile(file)

      event.target.value = ''
    },

    generate() {
      this.mask.photo.generateMask(this.mask.id)
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

    async onURL(url) {
      const file = await File.fromUrl(url, { watch: false })

      file.validateAs('image/png')

      this.file.writeFile(file)
    },

    async onFiles(files) {
      const file = await File.fromPath(files[0].path, { watch: false })

      file.validateAs('image/png')

      this.file.writeFile(file)
    },
  },
}
</script>

<style lang="scss" scoped>
.mask {
  @apply mb-0 relative;

  &.mask--dragging {
    .mask__dropzone {
      @apply flex opacity-100;
    }
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
  background-image: url('~@/assets/images/repeated-square-dark.png');
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
</style>
