<template>
  <div class="settings-folders">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="folder" /></span>
        <span>Folders</span>
      </h2>

      <h3 class="subtitle">
        Change the location of the components and files.
      </h3>
    </PageHeader>

    <div v-if="$dream.isPortable" class="notification">
      <span class="icon"><font-awesome-icon icon="exclamation-triangle" /></span>
      <span>These options cannot be changed in the portable version.</span>
    </div>

    <div v-else class="notification">
      <span class="icon"><font-awesome-icon icon="info-circle" /></span>
      <span>Changing this options needs a restart to take effect.</span>
    </div>

    <section class="box">
      <div class="box__content">
        <SettingsField v-model="value$" field-id="folders.cli">
          <input
            v-if="!$dream.isPortable"
            v-model="value$.folders.cli"
            readonly
            class="input"
            title="Change"
            @click.prevent="changePower">

          <input
            v-else
            disabled
            readonly
            :value="paths.getPowerPath()"
            class="input">
        </SettingsField>

        <SettingsField v-model="value$" field-id="folders.waifu">
          <input
            v-if="!$dream.isPortable"
            v-model="value$.folders.waifu"
            readonly
            class="input"
            title="Change"
            @click.prevent="changeWaifu">

          <input
            v-else
            disabled
            readonly
            :value="paths.getWaifuPath()"
            class="input">
        </SettingsField>

        <SettingsField v-model="value$" field-id="folders.models">
          <input
            v-if="!$dream.isPortable"
            v-model="value$.folders.models"
            :disabled="$dream.isPortable"
            class="input"
            readonly
            title="Change"
            @click.prevent="changeModels">

          <input
            v-else
            disabled
            readonly
            :value="paths.getModelsPath()"
            class="input">
        </SettingsField>

        <SettingsField v-model="value$" field-id="folders.cropped">
          <input
            v-if="!$dream.isPortable"
            v-model="value$.folders.cropped"
            :disabled="$dream.isPortable"
            class="input"
            readonly
            title="Change"
            @click.prevent="changeCropped">

          <input
            v-else
            disabled
            readonly
            :value="paths.getCropPath()"
            class="input">
        </SettingsField>
      </div>
    </section>
  </div>
</template>

<script>
import { isNil } from 'lodash'
import { VModel } from '~/mixins'

const { paths } = $provider
const { existsSync } = $provider.fs
const { dialog } = $provider.api

export default {
  mixins: [VModel],

  data: () => ({
    paths,
  }),

  methods: {
    showOpenDialog(path) {
      const dir = dialog.showOpenDialogSync({
        defaultPath: path,
        properties: ['openDirectory'],
      })

      if (isNil(dir)) {
        return path
      }

      if (!existsSync(dir[0])) {
        // ???
        return path
      }

      return dir[0]
    },

    changeModels() {
      if (this.$dream.isPortable) {
        return
      }

      const dir = this.showOpenDialog(this.value$.folders.models)
      this.value$.folders.models = dir
    },

    changeCropped() {
      if (this.$dream.isPortable) {
        return
      }

      const dir = this.showOpenDialog(this.value$.folders.cropped)
      this.value$.folders.cropped = dir
    },

    changePower() {
      if (this.$dream.isPortable) {
        return
      }

      const dir = this.showOpenDialog(this.value$.folders.cli)
      this.value$.folders.cli = dir
    },

    changeWaifu() {
      if (this.$dream.isPortable) {
        return
      }

      const dir = this.showOpenDialog(this.value$.folders.waifu)
      this.value$.folders.waifu = dir
    },
  },
}
</script>

<style lang="scss" scoped>
.settings-folders {
  .input {
    @apply cursor-pointer;
  }

  .notification {
    @apply mb-4;
  }
}
</style>
