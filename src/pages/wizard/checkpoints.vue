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
        This component is required to continue using {{ $dreamtime.name }}.
      </div>

      <div v-else class="notification">
        Installed version: <strong>{{ $checkpoints.version }}</strong>
      </div>

      <div v-if="updater.error" class="notification notification--danger">
        <h5>CONNECTION ERROR!</h5>
        <span>It is not possible to update this component because a problem has occurred when trying to get the information from Github, please make sure you have a stable internet connection and restart the application.</span>
        <br><br>

        <pre>
<span v-if="updater.errorResponse">{{ updater.errorResponse }}</span>
{{ updater.error.stack }}
</pre>
      </div>

      <AppBox>
        <ProjectUpdate project="checkpoints" />
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
