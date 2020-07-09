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
        Installed version: <strong>{{ $checkpoints.currentVersion }}</strong>
      </div>

      <AppBox>
        <ProjectUpdate project="checkpoints" />
      </AppBox>
    </div>
  </div>
</template>

<script>
import { requirements } from '~/modules/system'

export default {
  layout: 'wizard',

  middleware({ redirect }) {
    if (requirements.power.checkpoints) {
      redirect('/wizard/waifu')
    }
  },

  data: () => ({
    requirements,
  }),
}
</script>

<style lang="scss" scoped>
</style>
