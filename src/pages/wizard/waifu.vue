<template>
  <div class="wizard-project">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="sync-alt" /></span>
        <span>Updater</span>
      </h2>

      <h3 class="subtitle">
        {{ $waifu.name }}
      </h3>

      <template v-slot:right>
        <button class="button" @click="$dreamtime.openAppDataFolder()">
          <span class="icon"><font-awesome-icon icon="folder-open" /></span>
          <span>{{ $dreamtime.name }} Folder</span>
        </button>
      </template>
    </PageHeader>

    <div class="project__content">
      <div v-if="requirements.waifu.installed && !requirements.waifu.compatible" class="notification notification--danger">
        <h5>ALERT</h5>
        The installed version is not compatible with this version of {{ $dreamtime.name }}. Please update to continue.
      </div>

      <div v-else-if="requirements.waifu.installed" class="notification">
        Installed version: <strong>{{ $waifu.currentVersion }}</strong>
      </div>

      <div v-if="isMacOS" class="notification">
        <h5>Waifu2X on Mac OS is experimental!</h5>
        You may need to run the command <code>brew install openblas</code> before using it.
      </div>

      <div v-if="$settings.preferences.advanced.device === 'GPU'" class="notification">
        <h5>Waifu2X require CUDA 10.2</h5>
        Before using Waifu2X on GPU please <a href="https://developer.nvidia.com/cuda-10.2-download-archive" target="_blank">download and install CUDA 10.2</a>
      </div>

      <AppBox>
        <ProjectUpdate project="waifu" />
      </AppBox>

      <AppBox title="Settings.">
        <SettingsField v-if="!$dreamtime.isPortable" label="Location" field-id="folders.waifu">
          <input
            v-model="$settings.folders.waifu"
            readonly
            class="input"
            title="Change"
            @click="changeWaifu">
        </SettingsField>

        <SettingsField field-id="processing.usePython" />
      </AppBox>
    </div>

    <div class="wizard__footer">
      <button v-tooltip="'This component is optional.'" class="button button--xl" @click="skip">
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

  middleware({ redirect }) {
    if (requirements.waifu.installed && requirements.waifu.compatible && !waifu.updater.available) {
      redirect('/wizard/telemetry')
    }
  },

  data: () => ({
    requirements,
  }),

  computed: {
    isMacOS() {
      return process.platform === 'darwin'
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
