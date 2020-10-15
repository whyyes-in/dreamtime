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

      <template #right>
        <button class="button button--danger" @click="reset()">
          <span>Reset</span>
        </button>
      </template>
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
            :title="value$.folders.cli"
            @click.prevent="changePower">

          <input
            v-else
            disabled
            readonly
            :value="paths.getPowerPath()"
            :title="value$.folders.cli"
            class="input">
        </SettingsField>

        <SettingsField v-model="value$" field-id="folders.waifu">
          <input
            v-if="!$dream.isPortable"
            v-model="value$.folders.waifu"
            readonly
            class="input"
            :title="value$.folders.waifu"
            @click.prevent="changeWaifu">

          <input
            v-else
            disabled
            readonly
            :value="paths.getWaifuPath()"
            :title="value$.folders.waifu"
            class="input">
        </SettingsField>

        <SettingsField v-model="value$" field-id="folders.models">
          <input
            v-if="!$dream.isPortable"
            v-model="value$.folders.models"
            :disabled="$dream.isPortable"
            class="input"
            readonly
            :title="value$.folders.models"
            @click.prevent="changeModels">

          <input
            v-else
            disabled
            readonly
            :value="paths.getModelsPath()"
            :title="value$.folders.models"
            class="input">
        </SettingsField>

        <SettingsField v-model="value$" field-id="folders.cropped">
          <input
            v-if="!$dream.isPortable"
            v-model="value$.folders.cropped"
            :disabled="$dream.isPortable"
            class="input"
            readonly
            :title="value$.folders.cropped"
            @click.prevent="changeCropped">

          <input
            v-else
            disabled
            readonly
            :value="paths.getCropPath()"
            :title="value$.folders.cropped"
            class="input">
        </SettingsField>
      </div>
    </section>
  </div>
</template>

<script>
import { isNil, cloneDeep, merge } from 'lodash'
import Swal from 'sweetalert2/dist/sweetalert2'
import { VModel } from '~/mixins'

const { paths } = $provider
const { existsSync } = $provider.fs
const { dialog, app } = $provider.api

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

    async reset() {
      const response = await Swal.fire({
        title: 'Are you sure?',
        text: 'This will set all options in this section to their default values.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#F44336',
        confirmButtonText: 'Yes',
      })

      if (!response.value) {
        return
      }

      // eslint-disable-next-line no-underscore-dangle
      const settings = cloneDeep($provider.settings._default.folders)

      this.value$.folders = merge(this.value$.folders, settings)

      // Ugly...
      setTimeout(() => {
        app.relaunch()
        app.quit()
      }, 1000)
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
