<template>
  <div class="settings-app">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="window-maximize" /></span>
        <span>Application</span>
      </h2>

      <h3 class="subtitle">
        Settings that affect the behavior of the application.
      </h3>
    </PageHeader>

    <section class="box">
      <div class="box__content">
        <SettingsField field-id="app.disableHardwareAcceleration" />

        <SettingsField field-id="app.uploadMode" />

        <SettingsField field-id="app.duplicates" />
      </div>
    </section>

    <section class="box">
      <div class="box__header">
        <h2 class="title">
          Menus
        </h2>
        <h3 class="subtitle">
          Settings that affect the left and right menus.
        </h3>
      </div>

      <div class="box__content">
        <SettingsField field-id="app.queuePosition" />

        <SettingsField field-id="app.showAds" />

        <SettingsField field-id="app.showTips" />
      </div>
    </section>
  </div>
</template>

<script>
import { VModel } from '~/mixins'

export default {
  mixins: [VModel],
}
</script>
