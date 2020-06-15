<template>
  <div class="settings-fields">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="sliders-h" /></span>
        <span>Preferences</span>
      </h2>

      <h3 class="subtitle">
        Default settings for all photos.
        <AppTip tooltip="You can change these options individually in each photo." />
      </h3>
    </PageHeader>

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
