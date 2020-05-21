<template>
  <div class="wizard-project">
    <div class="layout__header">
      <h1 class="title">
        <font-awesome-icon icon="sync-alt" /> Updater
      </h1>

      <h2 class="subtitle">
        {{ $dream.name }}
      </h2>
    </div>

    <div class="project__content">
      <div class="project__update">
        <ProjectUpdate project="dreamtime" />
      </div>
    </div>
  </div>
</template>

<script>
import { dreamtime } from '~/modules/updater'

export default {
  layout: 'wizard',

  middleware({ redirect }) {
    if (!dreamtime.available) {
      redirect('/')
    }
  },
}
</script>
