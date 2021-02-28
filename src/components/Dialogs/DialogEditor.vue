<template>
  <dialog ref="dialog" class="dialog">
    <AppBox>
      <div ref="editor" class="editor" />

      <template #footer>
        <div class="box__footer buttons">
          <button class="button button--success" @click="apply">
            <span>Apply</span>
          </button>

          <button class="button button--danger" @click="close">
            Dismiss
          </button>
        </div>
      </template>
    </AppBox>
  </dialog>
</template>

<script>
import ImageEditor from 'tui-image-editor'
import { events, File } from '~/modules'
import { blackTheme } from '~/modules/editor.theme'

export default {
  props: {
    file: {
      type: File,
      required: true,
    },
    outputFile: {
      type: File,
      default: null,
    },
    watch: {
      type: Boolean,
      default: true,
    },
    cropWatch: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    editor: null,
  }),

  mounted() {
    if (this.watch) {
      this.file.on('loaded', this.onLoaded.bind(this))
    }
  },

  beforeDestroy() {
    if (this.watch) {
      this.file.off('loaded', this.onLoaded.bind(this))
    }
  },

  methods: {
    onLoaded() {
      if (this.editor) {
        this.editor.loadImageFromURL(this.file.url, this.file.name)
      }
    },

    create() {
      if (this.editor) {
        return
      }

      this.editor = new ImageEditor(this.$refs.editor, {
        includeUI: {
          loadImage: {
            path: this.file.url,
            name: this.file.name,
          },
          theme: blackTheme,
          initMenu: 'draw',
          menu: ['draw', 'shape', 'flip', 'rotate', 'filter', 'mask'],
          menuBarPosition: 'left',
        },
        usageStatistics: false,
      })
    },

    async open() {
      this.$refs.dialog.showModal()
      this.create()
    },

    close() {
      this.$refs.dialog.close()
    },

    async apply() {
      const dataURL = this.editor.toDataURL({
        format: this.file.extension,
        quality: 1,
        multiplier: 1,
      })

      if (this.outputFile) {
        await this.outputFile.writeDataURL(dataURL)
        await this.outputFile.load()
      }

      this.$emit('apply', dataURL)

      if (this.cropWatch) {
        events.emit('photo.editor.apply')
      }

      this.$refs.dialog.close()
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
  }
}
</style>
