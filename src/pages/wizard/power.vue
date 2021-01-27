<template>
  <div class="wizard-project">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="sync-alt" /></span>
        <span>Updater</span>
      </h2>

      <h3 class="subtitle">
        Nudification algorithm.
      </h3>

      <template #right>
        <button v-if="requirements.power.installed && requirements.power.compatible" class="button" @click="$router.replace('/')">
          <span class="icon"><font-awesome-icon icon="caret-left" /></span>
          <span>Go back</span>
        </button>

        <button class="button" @click="$dreamtime.openAppDataFolder()">
          <span class="icon"><font-awesome-icon icon="folder-open" /></span>
          <span>{{ $dreamtime.name }} folder</span>
        </button>
      </template>
    </PageHeader>

    <div class="project__content">
      <!-- Is required -->
      <div v-if="!requirements.power.installed" class="notification notification--warning">
        <span class="icon"><font-awesome-icon icon="info-circle" /></span>
        <span>To continue please install this component.</span>
      </div>

      <!-- INTERNAL ERROR! -->
      <div v-else-if="requirements.power.error" class="notification notification--danger">
        <h5>
          <span class="icon"><font-awesome-icon icon="exclamation-triangle" /></span>
          <span>INTERNAL ERROR!</span>
        </h5>

        {{ $dreamtime.name }} has not been able to verify that {{ $dreampower.name }} works correctly, please fix this issue before continuing. Visit <a href="https://dreamtime.tech/docs/guide/updater#problems" target="_blank">the website</a> with the most common problems or our <a href="http://forum.dreamtime.tech" target="_blank">forum</a> for technical support.
        <br><br>

        <pre>{{ requirements.power.error.stack }}</pre>
      </div>

      <!-- OUTDATED -->
      <div v-else-if="!requirements.power.compatible" class="notification notification--danger">
        <h5>
          <span class="icon"><font-awesome-icon icon="info-circle" /></span>
          <span>OUTDATED</span>
        </h5>

        To continue please install the update for this component.
      </div>

      <!-- Installed version -->
      <div v-if="$dreampower.version" class="notification">
        Installed version: <strong class="text-primary">{{ $dreampower.version }}</strong>
      </div>

      <!-- CONNECTION ERROR! -->
      <div v-if="updater.error" class="notification notification--danger">
        <h5>
          <span class="icon"><font-awesome-icon icon="exclamation-triangle" /></span>
          <span>CONNECTION ERROR!</span>
        </h5>
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
      <AppBox title="Settings">
        <!-- Download protocol. -->
        <MenuItem
          v-if="updater.hasTorrentUrls || updater.hasIPFSUrls"
          label="Download protocol."
          tooltip="- **Any:** Use all protocols if necessary.

- **HTTP:** Fastest and most reliable.

- **Torrent & IPFS:** Download the file from other computers with the option to cancel at any time and resume later. More reliable for unstable and low speed connections. May require a few minutes of preparation before starting the download.">
          <template #description>
            <span class="item__description">Protocol that will be used for the download.</span>
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
