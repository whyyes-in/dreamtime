<template>
  <div class="wizard-project">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="sync-alt" /></span>
        <span>Updater</span>
      </h2>

      <h3 class="subtitle">
        {{ $checkpoints.name }}
      </h3>

      <template v-slot:right>
        <button class="button" @click="$dreampower.openAppFolder()">
          <span class="icon"><font-awesome-icon icon="folder-open" /></span>
          <span>{{ $dreampower.name }} Folder</span>
        </button>
      </template>
    </PageHeader>

    <div class="project__content">
      <div v-if="!requirements.power.checkpoints" class="notification notification--warning">
        <span class="icon"><font-awesome-icon icon="info-circle" /></span>
        <span>This component needs to be installed to continue.</span>
      </div>

      <div v-else class="notification">
        Installed version: <strong>{{ $checkpoints.version }}</strong>
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
        <ProjectUpdate project="checkpoints" />
      </AppBox>

      <AppBox title="Settings.">
        <!-- Download protocol. -->
        <MenuItem
          label="Download protocol.">
          <template v-slot:description>
            <span class="item__description">Select the protocol that will be used to download the file. <AppTip tooltip="- <strong>Any</strong>: Use all protocols if necessary.<br>- <strong>HTTP</strong>: Download the file from verified servers. Fastest and most reliable for most connections.<br>- <strong>Torrent & IPFS</strong>: Download the file from other computers. It is possible to cancel the download and resume it later. More reliable for low speed connections. May require a few minutes of preparation before starting the download." /></span>
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
      </AppBox>
    </div>
  </div>
</template>

<script>
import { requirements } from '~/modules/system'
import { checkpoints } from '~/modules/projects'

export default {
  layout: 'wizard',

  middleware({ redirect, route }) {
    if (!route.query.forced) {
      if (requirements.power.checkpoints) {
        redirect('/wizard/waifu')
      }
    }
  },

  data: () => ({
    requirements,
  }),

  computed: {
    updater() {
      return checkpoints.updater
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
