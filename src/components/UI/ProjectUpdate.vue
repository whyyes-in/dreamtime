<template>
  <div v-if="isReady" class="update">
    <div class="update__info">
      <!-- Logo -->
      <figure>
        <img :src="info.logo">
      </figure>

      <h1 class="title">
        {{ info.title }} <span v-tooltip="'New version'">{{ updater.latestCompatible.tag_name }}</span>
      </h1>

      <h2 v-if="!updater.update.active" class="subtitle">
        {{ info.description }}
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
        Update
      </button>

      <button v-show="updater.update.active" class="button button--danger" @click.prevent="updater.cancel()">
        Cancel
      </button>
    </div>

    <!-- Project buttons -->
    <div class="update__actions__extra">
      <a v-for="(item, index) in info.navigation" :key="index" :href="item.href" target="_blank" class="button button--sm">{{ item.label }}</a>

      <button v-tooltip="'Show a list of links to download the update manually.'" class="button button--info button--sm" @click.prevent="$refs.mirrorsDialog.show()">
        Mirrors
      </button>
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
import { dreamtrack } from '~/modules/services'
import * as providers from '~/modules/updater'

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
    updater: null,
    info: null,
  }),

  computed: {
    isReady() {
      return this.updater && this.info
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
    this.updater = providers[this.project]

    this.info = dreamtrack.get(['projects', this.project, 'about'], {})
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
