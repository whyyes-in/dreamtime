<template>
  <div class="wizard-project">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="sync-alt" /></span>
        <span>Updater</span>
      </h2>

      <h3 class="subtitle">
        {{ $dreampower.name }}. Algorithm for nudification.
      </h3>

      <template #right>
        <button class="button" @click="$dreamtime.openAppDataFolder()">
          <span class="icon"><font-awesome-icon icon="folder-open" /></span>
          <span>{{ $dreamtime.name }} Folder</span>
        </button>
      </template>
    </PageHeader>

    <div class="project__content">
      <div v-if="!requirements.power.installed" class="notification notification--warning">
        <span class="icon"><font-awesome-icon icon="info-circle" /></span>
        <span>This component needs to be installed to continue.</span>
      </div>

      <div v-else-if="requirements.power.error" class="notification notification--danger">
        <h5>CHECK ERROR!</h5>
        Failed to get the installed {{ $dreampower.name }} version. Please fix this problem before continuing.<br>
        You can visit our <a href="https://chat.dreamnet.tech" target="_blank">chat</a> to get support.
        <br><br>

        <pre>{{ requirements.power.error.stack }}</pre>
      </div>

      <div v-else-if="!requirements.power.compatible" class="notification notification--danger">
        <h5>OUTDATED</h5>
        This component requires an update to continue.
      </div>

      <div v-if="$dreampower.version" class="notification">
        Installed version: <strong>{{ $dreampower.version }}</strong>
      </div>

      <div v-if="updater.error" class="notification notification--danger">
        <h5>CONNECTION ERROR!</h5>
        <span>A problem has occurred when trying to get the information from Github, please make sure you have a stable internet connection and restart the application.</span>
        <br><br>

        <pre>
<span v-if="updater.errorResponse">{{ updater.errorResponse }}</span>
{{ updater.error.stack }}
</pre>
      </div>

      <!-- Updater -->
      <AppBox>
        <ProjectUpdate project="dreampower" />
      </AppBox>

      <!-- Settings -->
      <AppBox title="Settings.">
        <!-- Download protocol. -->
        <MenuItem
          v-if="updater.hasTorrentUrls || updater.hasIPFSUrls"
          label="Download protocol."
          tooltip="- **Any:** Use all protocols if necessary.

- **HTTP:** Fastest and most reliable for most connections.

- **Torrent & IPFS:** Download the file from other computers with the option to cancel at any time and resume later. More reliable for unstable and low speed connections. May require a few minutes of preparation before starting the download.">
          <template #description>
            <span class="item__description">Select the protocol that will be used to download the file.</span>
          </template>

          <select v-model="updater.downloadMethod" class="input">
            <option :value="0">
              Any
            </option>

            <option :value="1">
              HTTP
            </option>

            <option v-if="updater.hasTorrentUrls" :value="3">
              Torrent
            </option>

            <option v-if="updater.hasIPFSUrls" :value="2">
              IPFS
            </option>
          </select>
        </MenuItem>

        <SettingsField v-if="!isMacOS"
                       field-id="preferences.advanced.device"
                       ignore-hardcoded
                       @change="$dreampower.updater.refresh()" />

        <SettingsField v-else field-id="preferences.advanced.device" description="Mac only supports CPU.">
          <select class="input" disabled>
            <option value="CPU" selected>
              CPU
            </option>
          </select>
        </SettingsField>

        <SettingsField v-if="!$dreamtime.isPortable" label="Location" field-id="folders.cli">
          <input
            v-model="$settings.folders.cli"
            :title="$settings.folders.cli"
            readonly
            class="input"
            :style="{ cursor: 'pointer' }"
            @click.prevent="changePower">
        </SettingsField>
      </AppBox>

      <hr>

      <PageHeader>
        <h2 class="title">
          <span class="icon"><font-awesome-icon icon="book" /></span>
          <span>Changelog</span>
        </h2>
      </PageHeader>

      <!-- Changelog -->
      <ProjectChangelog project="dreampower" :limit="1" />
    </div>
  </div>
</template>

<script>
import { isNil } from 'lodash'
import { requirements } from '~/modules/system'
import { dreampower } from '~/modules/projects'

const { dialog } = $provider.api
const { existsSync } = $provider.fs

export default {
  layout: 'wizard',

  middleware({ redirect, route }) {
    if (!route.query.forced) {
      if (requirements.power.installed && requirements.power.compatible && !dreampower.updater.available) {
        redirect('/wizard/checkpoints')
      }
    }
  },

  data: () => ({
    requirements,
  }),

  computed: {
    isMacOS() {
      return process.platform === 'darwin'
    },

    updating() {
      return this.$dreampower.updater.update.active
    },

    updater() {
      return dreampower.updater
    },
  },

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

    changePower() {
      const dir = this.showOpenDialog(this.$settings.folders.cli)
      this.$settings.folders.cli = dir
    },
  },
}
</script>
