<template>
  <div class="settings-fields">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="sliders-h" /></span>
        <span>Photo Preferences</span>
      </h2>

      <h3 class="subtitle">
        Default preferences for new photos.
        <AppTip tooltip="You can change these options individually in each photo." />
      </h3>

      <template v-slot:right>
        <button class="button button--danger" @click="reset()">
          <span>Reset</span>
        </button>
      </template>
    </PageHeader>

    <AppNotification v-if="value$.preferences.mode === 3" name="advanced-mode" class="notification--info">
      <span class="icon"><font-awesome-icon icon="exclamation-triangle" /></span>
      <span>Custom masks mode is recommended only for experienced users. Are you sure this is the mode you want? You can get more information <a href="https://dreamtime.tech/docs/guide/custom-masks/" target="_blank">here</a>.</span>
    </AppNotification>

    <SettingsPreferences v-model="value$.preferences" />
  </div>
</template>

<script>
import { cloneDeep, merge } from 'lodash'
import Swal from 'sweetalert2/dist/sweetalert2'
import { VModel } from '~/mixins'

export default {
  mixins: [VModel],

  methods: {
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
      const settings = cloneDeep($provider.settings._default.preferences)
      delete settings.advanced.device

      this.value$.preferences = merge(this.value$.preferences, settings)

      window.$redirect('/')
    },
  },
}
</script>

<style lang="scss" scoped>
.title {
  @apply text-white text-lg font-bold mb-4 mt-0;
}
</style>
