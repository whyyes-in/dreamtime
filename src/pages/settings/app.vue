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
        <button v-tooltip="'Open the developer tools. This includes the application logs.'"
                class="button"
                @click.prevent="openDevTools">
          <span class="icon"><font-awesome-icon icon="code" /></span>
          <span>DevTools</span>
        </button>
      </template>
    </PageHeader>

    <div class="alerts">
      <!-- Models Folder -->
      <div v-if="!requirements.folders.models" class="notification notification--danger">
        <span class="icon"><font-awesome-icon icon="exclamation-triangle" /></span>
        <span v-if="!$dream.isPortable">
          The <strong>Models</strong> folder has <strong>invalid characters</strong>. <nuxt-link to="/settings/folders">Please change the location of the folder.</nuxt-link>
        </span>
        <span v-else>
          The place where you have extracted {{ $dream.name }} has <strong>invalid characters</strong>.
          Please move the application to another place.
        </span>
      </div>

      <!-- GPU -->
      <div v-if="$settings.preferences.advanced.device === 'GPU'">
        <div v-if="!requirements.recommended.vram" class="notification notification--warning">
          <span class="icon"><font-awesome-icon icon="exclamation-triangle" /></span>
          <span>Your NVIDIA GPU has very low VRAM! The algorithm is very likely to fail.</span>
        </div>
      </div>

      <!-- RAM -->
      <div v-if="!requirements.recommended.ram" class="notification notification--warning">
        <span class="icon"><font-awesome-icon icon="exclamation-triangle" /></span>
        <span>Your system has less than <strong>12 GB</strong> of RAM.</span>
      </div>
    </div>

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
import { requirements } from '~/modules/system'

export default {
  mixins: [VModel],

  data: () => ({
    requirements,
  }),

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
