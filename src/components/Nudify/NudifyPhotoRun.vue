<template>
  <div class="box run" :class="previewClass">
    <div class="box__photo run__photo" data-private>
      <video v-if="file.exists && isVideo"
             :src="file.url"
             class="run__video__preview"
             autoplay
             muted
             loop
             @click="openPreview" />

      <div v-else-if="file.exists"
           class="run__photo__preview"
           :style="{ backgroundImage: `url('${file.url}')` }"
           @click="openPreview" />
    </div>

    <div
      v-if="run.preferences.body.randomize || run.preferences.body.progressive.enabled"
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

      <!--
      <button
        v-if="run.finished && run.outputFile.exists"
        v-tooltip="'Open photo'"
        class="button button--info button--sm"
        @click.prevent="open">
        <font-awesome-icon icon="image" />
      </button>
      -->

      <button
        v-if="run.finished && run.outputFile.exists"
        key="button-save"
        class="button button--success button--sm"
        @click.prevent="save">
        <span class="icon">
          <font-awesome-icon icon="save" />
        </span>
        <span>Save</span>
      </button>

      <button v-if="run.finished"
              key="button-rerun"
              class="button button--info button--sm"
              @click.prevent="rerun">
        <span class="icon">
          <font-awesome-icon icon="retweet" />
        </span>
        <span>Rerun</span>
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
  </div>
</template>

<script>
import { dreamtrack } from '~/modules/services'
import { Nudify } from '~/modules/nudify'

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

.run__video__preview {
  @apply h-full w-full overflow-hidden;
  cursor: zoom-in;
}

.run__preferences {
  @apply absolute top-0 z-20;
  @apply flex opacity-0 bg-menus-default-80 w-full;
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
</style>
