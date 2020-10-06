<template>
  <div class="wizard-project">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="sync-alt" /></span>
        <span>Updater</span>
      </h2>

      <h3 class="subtitle">
        {{ $dreamtime.name }}
      </h3>
    </PageHeader>

    <div class="project__content">
      <div v-if="!$dreamtime.isPortable && isLinux" class="notification">
        <span class="icon"><font-awesome-icon icon="info-circle" /></span> Linux users: it is recommended to update {{ $dreamtime.name }} with Snap instead:<br><code>sudo snap refresh dreamtimetech</code>
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
        <ProjectUpdate project="dreamtime" />
      </AppBox>

      <hr>

      <PageHeader>
        <h2 class="title">
          <span class="icon"><font-awesome-icon icon="book" /></span>
          <span>Changelog</span>
        </h2>
      </PageHeader>

      <!-- Changelog -->
      <ProjectChangelog project="dreamtime" :limit="1" />
    </div>
  </div>
</template>

<script>
import { dreamtime } from '~/modules/updater'

export default {
  layout: 'wizard',

  computed: {
    updater() {
      return dreamtime
    },

    isLinux() {
      return process.platform === 'linux'
    },
  },
}
</script>
