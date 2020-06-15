<template>
  <div class="preferences">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="sliders-h" /></span>
        <span>Preferences</span>
      </h2>

      <h3 class="subtitle">
        Settings for the photo.
        <AppTip tooltip="These preferences will only apply to the current photo. To change default preferences visit the settings." />
      </h3>
    </PageHeader>

    <SettingsPreferences v-model="photo.preferences" />
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
