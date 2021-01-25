<template>
  <div class="box run" :class="previewClass">
    <!-- Preview -->
    <div class="box__photo run__photo">
      <video v-if="file.exists && isVideo"
             :src="file.url"
             class="run__video__preview"
             autoplay
             muted
             loop
             data-private
             @click="openPreview" />

      <div v-else-if="file.exists"
           class="run__photo__preview"
           :style="{ backgroundImage: `url('${file.url}')` }"
           data-private
           @click="openPreview" />

      <div v-if="run.algorithmStatus !== ALGORITHM.NONE" class="run__photo__status">
        <span v-if="run.algorithmStatus === ALGORITHM.DREAMPOWER" key="dreampower" v-tooltip="'The photo is being nudified by the algorithm.'">
          Nudifying
        </span>
        <span v-if="run.algorithmStatus === ALGORITHM.WAIFU2X" key="waifu2x" v-tooltip="'The photo is being upscaled by Waifu2X.'">Upscaling</span>
        <span v-if="run.algorithmStatus === ALGORITHM.DREAMTIME" key="dreamtime" v-tooltip="'The photo is being prepared by DreamTime.'">Other</span>
        <span v-if="run.frameStatus" v-tooltip="'Video frame.'"> ({{ run.frameStatus }})</span>
      </div>
    </div>

    <!-- Preferences -->
    <div
      v-if="run.preferences.body.runs.mode !== false"
      class="run__preferences">
      <div class="preference">
        <span>Boobs</span>
        <span>{{ run.preferences.body.boobs.size | fixedValue }}</span>
      </div>

      <div class="preference">
        <span>Areola</span>
        <span>{{ run.preferences.body.areola.size | fixedValue }}</span>
      </div>

      <div class="preference">
        <span>Nipple</span>
        <span>{{ run.preferences.body.nipple.size | fixedValue }}</span>
      </div>

      <div class="preference">
        <span>Vagina</span>
        <span>{{ run.preferences.body.vagina.size | fixedValue }}</span>
      </div>

      <div class="preference">
        <span>Pubic hair</span>
        <span>{{ run.preferences.body.pubicHair.size | fixedValue }}</span>
      </div>
    </div>

    <!-- Buttons -->
    <div class="box__footer buttons">
      <div v-if="run.running" key="button-status" class="button button--sm">
        <span class="icon">
          <font-awesome-icon icon="running" />
        </span>
        <span>{{ run.timer.duration }}s</span>
      </div>

      <div v-else-if="run.failed" key="button-status" class="button button--danger button--sm">
        <span class="icon">
          <font-awesome-icon icon="exclamation-circle" />
        </span>
        <span>Error!</span>
      </div>

      <div v-else-if="run.finished" key="button-status" class="button button--sm">
        <span class="icon">
          <font-awesome-icon icon="heart" />
        </span>
        <span>{{ run.timer.duration }}s</span>
      </div>

      <div v-else key="button-status" class="button button--sm">
        <span>
          <font-awesome-icon icon="clock" />
        </span>
      </div>

      <button
        key="button-terminal"
        v-tooltip="'View terminal'"
        class="button button--sm"
        @click.prevent="$refs.terminalDialog.showModal()">
        <font-awesome-icon icon="terminal" />
      </button>

      <button
        v-if="run.successful && run.preferences.advanced.useClothTransparencyEffect"
        key="button-transparency"
        v-tooltip="'X-Rays Tool'"
        class="button button--primary button--sm"
        @click="showTransparencyModal()">
        <span class="icon">
          <font-awesome-icon icon="spray-can" />
        </span>
      </button>

      <button
        v-if="run.successful"
        key="button-save"
        v-tooltip="'Save'"
        class="button button--success button--sm"
        @click.prevent="save">
        <span class="icon">
          <font-awesome-icon icon="save" />
        </span>
      </button>

      <button v-if="run.finished"
              key="button-rerun"
              v-tooltip="'Rerun'"
              class="button button--info button--sm"
              @click.prevent="rerun">
        <span class="icon">
          <font-awesome-icon icon="retweet" />
        </span>
      </button>

      <button v-if="run.running"
              key="button-stop"
              v-tooltip="'Stop'"
              class="button button--danger button--sm"
              @click.prevent="cancel">
        <font-awesome-icon icon="stop" />
      </button>
    </div>

    <!-- Terminal Dialog -->
    <dialog ref="terminalDialog">
      <div class="dialog__content">
        <div class="terminal">
          <li
            v-for="(item, index) in run.cli.lines"
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

          <MenuItem
            label="Transparency">
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

          <button class="button button--danger" @click="$refs.transparencyDialog.close()">
            Close
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script>
import { debounce } from 'lodash'
import { saveAs } from 'file-saver'
import { dreamtrack } from '~/modules/services'
import { Nudify } from '~/modules/nudify'
import { ALGORITHM } from '~/modules/nudify/photo-run'
import { STEP } from '~/modules/nudify/photo-mask'

export default {
  filters: {
    size(value) {
      return Number.parseFloat(value).toFixed(2)
    },

    fixedValue(value) {
      return Number(value).toFixed(2)
    },
  },

  props: {
    run: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    ALGORITHM,
    transparency: {
      alpha: 0.5,
      nude: undefined,
      corrected: undefined,
      canvas: undefined,
    },
  }),

  computed: {
    isVideo() {
      return this.run.photo.file.isVideo
    },

    file() {
      return this.run.outputFile
    },

    previewStyle() {
      if (!this.run.finished) {
        return {}
      }

      const url = encodeURI(this.run.outputFile.path)

      return { backgroundImage: `url(${url})` }
    },

    previewClass() {
      return {
        'run--failed': this.run.failed,
        'run--running': this.run.running,
        'run--finished': this.run.finished,
      }
    },

    manualURL() {
      return dreamtrack.get(
        'urls.docs.manual',
        'https://time.dreamnet.tech/docs/guide/upload',
      )
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

  methods: {
    save() {
      this.run.outputFile.save(this.run.outputName)
    },

    openPreview() {
      this.run.outputFile.openItem()
    },

    rerun() {
      this.run.add()
    },

    cancel() {
      this.run.cancel()
    },

    addMaskToQueue() {
      Nudify.add(this.run.maskfinFile, { isMaskfin: true })
    },

    saveMask() {
      this.run.maskfinFile.save(`maskfin-${this.run.outputName}`)
    },

    showTransparencyModal() {
      this.transparencyRefresh()

      this.$refs.transparencyDialog.showModal()
    },

    async transparencyRefresh() {
      if (!this.run.outputFile.exists) {
        throw new Warning('The fake nude has not been created.')
      }

      if (!this.run.photo.masks[STEP.CORRECT].exists) {
        throw new Warning('The "Corrected" mask has not been created.')
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

      if (!this.transparency.nude) {
        const nude = new Image()
        nude.src = this.run.outputFile.path

        await new Promise((resolve) => {
          nude.onload = () => resolve()
        })

        this.transparency.nude = nude
      }

      if (!this.transparency.corrected) {
        const corrected = new Image()
        corrected.src = this.run.photo.masks[STEP.CORRECT].file.path

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
.run {
  @apply mb-0 relative border border-transparent;

  &.run--running {
    @apply border-primary;
  }

  &.run--failed {
    @apply border-danger;
  }

  &:hover {
    .run__preferences {
      @apply opacity-100;
    }
  }
}

.run__photo {
  background-image: url('~@/assets/images/repeated-square-dark.png');
  will-change: transform;
  height: 500px;
}

.run__photo__preview {
  @apply absolute top-0 bottom-0 left-0 right-0 z-10;
  @apply bg-contain bg-no-repeat bg-center;
  cursor: zoom-in;
}

.run__photo__status {
  @apply absolute z-20;
  @apply bg-primary py-2 px-6 rounded-br rounded-tr text-black font-semibold;
  left: 0;
  bottom: 20px;
  cursor: help;
}

.run__video__preview {
  @apply h-full w-full overflow-hidden;
  cursor: zoom-in;
}

.run__preferences {
  @apply absolute top-0 z-20;
  @apply flex opacity-0 bg-menus-DEFAULT-80 w-full;
  backdrop-filter: blur(6px);
  transition: opacity 0.1s linear;
  height: 80px;

  .preference {
    @apply flex flex-col flex-1 items-center justify-center;

    span {
      &:first-child {
        @apply text-xs;
      }

      &:last-child {
        @apply text-sm text-white font-bold;
      }
    }
  }
}

.buttons {
  @apply justify-end;

  .button {
    max-width: 100px;
  }
}

.terminal {
  @apply p-2 bg-black overflow-auto rounded;
  height: 400px;

  li {
    @apply font-mono text-xs text-generic-100 mb-3 block;

    &.text-danger {
      @apply text-danger-500;
    }
  }
}

.transparency {
  width: 512px;
  height: 512px;
}
</style>
