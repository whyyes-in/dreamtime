<template>
  <div class="wizard-project">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="sync-alt" /></span>
        <span>Updater</span>
      </h2>

      <h3 class="subtitle">
        {{ $waifu.name }}. Optional algorithm to upscale photos.
      </h3>

      <template v-slot:right>
        <button class="button" @click="$dreamtime.openAppDataFolder()">
          <span class="icon"><font-awesome-icon icon="folder-open" /></span>
          <span>{{ $dreamtime.name }} Folder</span>
        </button>
      </template>
    </PageHeader>

    <div class="project__content">
      <div v-if="requirements.waifu.error" class="notification notification--danger">
        <h5>CHECK ERROR!</h5>
        Failed to get the installed {{ $dreampower.name }} version. Please fix this problem before continuing.<br>
        You can visit our <a href="https://chat.dreamnet.tech" target="_blank">chat</a> to get support.
        <br><br>

        <pre>{{ requirements.waifu.error.stack }}</pre>
      </div>

      <div v-else-if="requirements.waifu.installed && !requirements.waifu.compatible" class="notification notification--danger">
        <h5>OUTDATED</h5>
        This component requires an update to continue.
      </div>

      <div v-if="$waifu.version" class="notification">
        Installed version: <strong>{{ $waifu.version }}</strong>
      </div>

      <div v-if="isMacOS" class="notification">
        You may need to run the command <code>brew install openblas</code> before using Waifu2X.
      </div>

      <div v-if="$settings.preferences.advanced.device === 'GPU'" class="notification">
        <h5>Waifu2X require CUDA 10.2</h5>
        Before using Waifu2X on GPU please <a href="https://developer.nvidia.com/cuda-10.2-download-archive" target="_blank">download and install CUDA 10.2</a>
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

      <AppBox>
        <ProjectUpdate project="waifu" />
      </AppBox>

      <AppBox title="Settings.">
        <!-- Download protocol. -->
        <MenuItem
          v-if="updater.hasTorrentUrls || updater.hasIPFSUrls"
          label="Download protocol."
          tooltip="- **Any:** Use all protocols if necessary.

- **HTTP:** Fastest and most reliable for most connections.

- **Torrent & IPFS:** Download the file from other computers with the option to cancel at any time and resume later. More reliable for unstable and low speed connections. May require a few minutes of preparation before starting the download.">
          <template v-slot:description>
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

        <SettingsField v-if="!$dreamtime.isPortable" label="Location" field-id="folders.waifu">
          <input
            v-model="$settings.folders.waifu"
            readonly
            class="input"
            title="Change"
            @click="changeWaifu">
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
      <ProjectChangelog project="waifu" :limit="1" />
    </div>

    <div class="wizard__footer">
      <button v-if="!requirements.waifu.installed"
              v-tooltip="'This component is optional.'"
              class="button button--xl"
              @click="skip">
        Skip
      </button>
    </div>
  </div>
</template>

<script>
import { isNil } from 'lodash'
import { requirements } from '~/modules/system'
import { waifu } from '~/modules/projects'

const { dialog } = $provider.api
const { existsSync } = $provider.fs

export default {
  layout: 'wizard',

  middleware({ redirect, route }) {
    if (!route.query.forced) {
      if (requirements.waifu.installed && requirements.waifu.compatible && !waifu.updater.available) {
        redirect('/wizard/telemetry')
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

    updater() {
      return waifu.updater
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

    changeWaifu() {
      const dir = this.showOpenDialog(this.$settings.folders.waifu)
      this.$settings.folders.waifu = dir
    },

    skip() {
      this.$settings.wizard.waifu = true
      this.$router.push('/wizard/telemetry')
    },
  },
}
</script>
