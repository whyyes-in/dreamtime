<template>
  <div class="wizard-project">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="sync-alt" /></span>
        <span>Updater</span>
      </h2>

      <h3 class="subtitle">
        {{ $dreampower.name }}
      </h3>

      <template v-slot:right>
        <button class="button" @click="$dreamtime.openAppDataFolder()">
          <span class="icon"><font-awesome-icon icon="folder-open" /></span>
          <span>{{ $dreamtime.name }} Folder</span>
        </button>
      </template>
    </PageHeader>

    <div class="project__content">
      <div v-if="!requirements.power.installed" class="notification notification--warning">
        This component is required to continue using {{ $dreamtime.name }}.
      </div>

      <div v-else-if="!requirements.power.compatible" class="notification notification--danger">
        <h5>ALERT</h5>
        The installed version is not compatible with this version of {{ $dreamtime.name }}. Please update to continue.
      </div>

      <div v-else class="notification">
        Installed version: <strong>{{ $dreampower.currentVersion }}</strong>
      </div>

      <AppBox>
        <ProjectUpdate project="dreampower" />
      </AppBox>

      <AppBox title="Settings.">
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
            readonly
            class="input"
            title="Change"
            @click.prevent="changePower">
        </SettingsField>

        <SettingsField field-id="processing.usePython" />
      </AppBox>
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

  middleware({ redirect }) {
    if (requirements.power.installed && requirements.power.compatible && !dreampower.updater.available) {
      redirect('/wizard/checkpoints')
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
