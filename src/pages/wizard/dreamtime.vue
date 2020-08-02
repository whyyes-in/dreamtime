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
        <ProjectUpdate project="dreamtime" />
      </AppBox>
    </div>
  </div>
</template>

<script>
import { dreamtime } from '~/modules/updater'

export default {
  layout: 'wizard',

  middleware({ redirect, route }) {
    if (!route.query.forced) {
      if (!dreamtime.available) {
        redirect('/')
      }
    }
  },

  computed: {
    updater() {
      return dreamtime
    },
  },
}
</script>
