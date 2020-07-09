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

      <template v-slot:right>
        <button class="button"
                @click.prevent="openDevTools">
          <span class="icon"><font-awesome-icon icon="code" /></span>
          <span>DevTools</span>
        </button>
      </template>
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

        <SettingsField field-id="app.showAds" @change="onChangeAds" />

        <SettingsField field-id="app.showTips" @change="onChangeAds" />
      </div>
    </section>
  </div>
</template>

<script>
import { VModel } from '~/mixins'
import { events } from '~/modules'

export default {
  mixins: [VModel],

  methods: {
    openDevTools() {
      const mainWindow = require('electron').remote.BrowserWindow.getAllWindows()[0]
      mainWindow.webContents.openDevTools()
    },

    onChangeAds() {
      events.emit('settings:ads')
    },
  },
}
</script>
