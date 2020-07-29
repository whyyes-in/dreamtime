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
    </PageHeader>

    <div v-if="value$.preferences.mode === 3" class="notification notification--info">
      <span class="icon"><font-awesome-icon icon="exclamation-triangle" /></span>
      <span>Advanced mode is recommended only for experienced users. <a href="https://dreamtime.tech/docs/guide/custom-masks/" target="_blank">Click here to visit the guide</a>.</span>
    </div>

    <SettingsPreferences v-model="value$.preferences" />
  </div>
</template>

<script>
import { VModel } from '~/mixins'

export default {
  mixins: [VModel],
}
</script>

<style lang="scss" scoped>
.title {
  @apply text-white text-lg font-bold mb-4 mt-0;
}
</style>
