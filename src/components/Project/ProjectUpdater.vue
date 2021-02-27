<template>
  <div class="project">
    <AppBox v-if="updater.enabled">
      <div v-tooltip="project.description" class="project__brand">
        <figure>
          <img :src="project.logo">
        </figure>

        <div class="project__title">
          <span>{{ project.name }}</span>
          <span class="project__version">{{ updater.latestVersion }}</span>
        </div>
      </div>

      <div class="project__status" />

      <div class="project_buttons buttons">
        <button v-tooltip="installTooltip" class="button button--success">
          <span class="icon"><FontAwesomeIcon :icon="installIcon" /></span>
          <span>{{ installLabel }}</span>
        </button>

        <button v-tooltip="'Changelog'" class="button button--info">
          <FontAwesomeIcon icon="book" />
        </button>

        <button v-tooltip="'Settings'" class="button" @click="$refs.settings.showModal()">
          <FontAwesomeIcon icon="cog" />
        </button>
      </div>
    </AppBox>

    <dialog ref="settings" class="dialog">
      <AppBox :title="`${project.name}: Settings`">
        <SettingsField field-id="custom.updater.version">
          <select v-model="updater.destVersion" class="input" />
        </SettingsField>

        <template #footer>
          <div class="box__footer box__footer--buttons">
            <button class="button flex-1 button--danger" @click="$refs.settings.close()">
              Close
            </button>
          </div>
        </template>
      </AppBox>
    </dialog>
  </div>
</template>

<script>
import * as projects from '~/modules/projects'

export default {
  props: {
    name: {
      type: String,
      required: true,
    },
  },

  data: () => ({
    project: null,
  }),

  computed: {
    updater() {
      return this.project.updater
    },

    isPreparing() {
      return this.updater?.status.message === 'preparing'
    },

    isDownloading() {
      return this.updater?.status.message === 'downloading'
    },

    isInstalling() {
      return this.updater?.status.message === 'installing'
    },

    installLabel() {
      if (!this.project.isInstalled) {
        return 'Install'
      }

      return this.updater.available ? 'Update' : 'Reinstall'
    },

    installIcon() {
      if (!this.project.isInstalled) {
        return 'download'
      }

      return this.updater.available ? 'sync' : 'wrench'
    },

    installTooltip() {
      if (!this.project.isInstalled) {
        return '❌ Not installed.'
      }

      if (this.updater.available) {
        return '🎉 Update available!'
      }

      return '👍 Latest version installed.'
    },
  },

  created() {
    // eslint-disable-next-line import/namespace
    this.project = projects[this.name]
  },

  beforeDestroy() {
    this.updater.cancel()
  },
}
</script>

<style lang="scss" scoped>
.project {
  &::v-deep {
    .box__content {
      @apply flex items-center gap-3;
    }
  }

  &:not(:last-child) {
    @apply mb-3;
  }
}

.project__brand {
  @apply flex items-center gap-6 cursor-help;

  figure img {
    @apply rounded-full;
    height: 60px;
  }

  .project__title {
    @apply font-bold text-white;

    span {
      @apply block;
    }
  }

  .project__version {
    @apply text-primary;
  }
}

.project__status {
  @apply flex-1;
}
</style>
