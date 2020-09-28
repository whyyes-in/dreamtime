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
        <button class="button button--danger" @click="reset()">
          <span>Reset</span>
        </button>

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
import { cloneDeep, merge } from 'lodash'
import Swal from 'sweetalert2/dist/sweetalert2'
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
      const settings = cloneDeep($provider.settings._default.app)
      delete settings.window

      this.value$.app = merge(this.value$.app, settings)

      window.$redirect('/')
    },
  },
}
</script>
