<template>
  <div v-if="isReady" class="update">
    <div class="update__info">
      <!-- Logo -->
      <figure>
        <img :src="data.logo">
      </figure>

      <h1 class="title">
        {{ data.name }} <span v-tooltip="'New version'">{{ updater.latestCompatible.tag_name }}</span>
      </h1>

      <h2 v-if="!updater.update.active" class="subtitle">
        {{ data.description }}
      </h2>
    </div>

    <!-- Downloading -->
    <div v-if="isDownloading && updater.update.progress >= 0" class="update__status">
      Downloading ~ <strong>{{ updater.update.progress }}%</strong> ~ {{ updater.update.written | size }}/{{ updater.update.total | size }} MB.
    </div>

    <!-- Downloading -->
    <div v-else-if="isDownloading" class="update__status">
      Downloading ~ {{ updater.update.written | size }} MB.
    </div>

    <!-- Installing -->
    <div v-else-if="isInstalling" class="update__status">
      Installing...
    </div>

    <!-- Download Progress -->
    <div v-if="isDownloading && updater.update.progress >= 0" class="update__progressbar">
      <progress min="0" max="100" :value="updater.update.progress" />
    </div>

    <!-- Actions -->
    <div class="update__actions">
      <button v-show="!updater.update.active" class="button button--success" @click.prevent="updater.start()">
        <span class="icon"><font-awesome-icon icon="sync" /></span>
        Update
      </button>

      <a v-if="project === 'waifu' && $settings.preferences.advanced.device === 'GPU'"
         v-tooltip="'Software required to use Waifu2X on GPU.'"
         class="button button--danger"
         href="https://developer.nvidia.com/cuda-10.2-download-archive"
         target="_blank">
        <span class="icon"><font-awesome-icon icon="download" /></span>
        <span>CUDA 10.2</span>
      </a>

      <button v-show="updater.update.active" class="button button--danger" @click.prevent="updater.cancel()">
        <span class="icon"><font-awesome-icon icon="stop" /></span>
        Cancel
      </button>

      <button v-tooltip="'List of links to download the update manually.'" class="button button--info" @click.prevent="$refs.mirrorsDialog.show()">
        <span class="icon"><font-awesome-icon icon="link" /></span>
        Mirrors
      </button>
    </div>

    <!-- Project buttons -->
    <div class="update__actions__extra">
      <a v-for="(item, index) in data.data.navigation"
         :key="index"
         :href="item.
           ref"
         target="_blank"
         class="button button--sm">{{ item.label }}</a>
    </div>

    <!-- Hint -->
    <div class="update__hint">
      <p>
        <a href="https://time.dreamnet.tech/docs/guide/updater" target="_blank">
          <font-awesome-icon icon="exclamation-circle" />
          Troubleshooting
        </a>
      </p>
    </div>

    <!-- Mirrors Dialog -->
    <dialog ref="mirrorsDialog">
      <div class="dialog__content">
        <ul class="mirrors">
          <li v-for="(item, index) in updater.downloadUrls" :key="index">
            <a :href="item" target="_blank">{{ item | domain }}</a>
          </li>
        </ul>

        <div class="dialog__buttons">
          <button class="button button--danger" @click.prevent="$refs.mirrorsDialog.close()">
            Close
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script>
import { toNumber } from 'lodash'
import * as projects from '~/modules/projects'

export default {
  filters: {
    progress(value) {
      value = toNumber(value).toFixed(2)
      return `${value}%`
    },

    size(value) {
      value = toNumber(value).toFixed(2)
      return value
    },

    domain(value) {
      return (new URL(value)).hostname
    },
  },

  props: {
    project: {
      type: String,
      required: true,
    },
  },

  data: () => ({
    data: null,
  }),

  computed: {
    updater() {
      return this.data.updater
    },

    isReady() {
      return this.updater
    },

    currentVersion() {
      return this.updater?.currentVersion || 'v0.0.0'
    },

    isDownloading() {
      return this.updater?.update?.status === 'downloading'
    },

    isInstalling() {
      return this.updater?.update?.status === 'installing'
    },
  },

  created() {
    // eslint-disable-next-line import/namespace
    this.data = projects[this.project]
  },

  beforeDestroy() {
    this.updater.cancel()
  },
}
</script>

<style lang="scss" scoped>
.update {
  @apply flex flex-col items-center justify-center;
}

.update__info {
  @apply text-center mb-6;

  figure {
    @apply mb-4 text-6xl;

    img {
      @apply inline-block;
      height: 100px;
    }
  }

  .title {
    @apply text-2xl text-white font-semibold;

    span {
      @apply text-primary-500 font-bold;
      cursor: help;
    }
  }

  .subtitle {
    @apply text-lg;
  }
}

.update__status {
  @apply mb-4 text-lg;
}

.update__progressbar {
  @apply mb-4;
  width: 80%;

  progress {
    @apply w-full border-0 bg-dark-600;
    height: 18px;
    border-radius: 9px;

    &::-webkit-progress-bar {
      @apply bg-dark-500;
      border-radius: 9px;
    }

    &::-webkit-progress-value {
      @apply bg-primary-500;
      border-radius: 9px;
    }
  }
}

.update__actions {
  @apply mb-4;

  .button {
    &:not(:last-child) {
      @apply mr-4;
    }
  }
}

.update__actions__extra {
  @apply mb-6;

  .button {
    &:not(:last-child) {
      @apply mr-2;
    }
  }
}

.update__hint {
  @apply text-sm;

  a {
    @apply text-white underline;
  }
}

.mirrors {
  @apply list-disc ml-6;

  a:hover {
    @apply underline;
  }
}
</style>
