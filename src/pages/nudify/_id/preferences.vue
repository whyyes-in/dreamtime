<template>
  <div class="preferences">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="sliders-h" /></span>
        <span>Photo Preferences</span>
      </h2>

      <h3 class="subtitle">
        Settings for the photo.
        <AppTip tooltip="These preferences will only apply to the current photo. To change default preferences visit the settings." />
      </h3>
    </PageHeader>

    <AppNotification v-if="photo.preferences.mode === 3" name="advanced-mode" class="notification--warning">
      <span class="icon"><font-awesome-icon icon="exclamation-triangle" /></span>
      <span>Custom masks mode is recommended only for experienced users. Are you sure this is the mode you want?<br><a href="https://dreamtime.tech/docs/guide/custom-masks/" target="_blank">Read the guide to understand how this mode works.</a></span>
    </AppNotification>

    <SettingsPreferences v-model="photo.preferences" :animated="!photo.canModify" />
  </div>
</template>

<script>
export default {
  computed: {
    photo() {
      return this.$parent.photo
    },
  },
}
</script>

<style lang="scss" scoped>
.preferences {

}
</style>
