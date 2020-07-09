<template>
  <div class="settings-fields">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="paper-plane" /></span>
        <span>Telemetry</span>
      </h2>

      <h3 class="subtitle">
        Settings for sending usage information to improve the application.
      </h3>
    </PageHeader>

    <section class="box">
      <div class="box__content">
        <SettingsField v-model="value$" field-id="user" readonly />

        <SettingsField v-model="value$" field-id="telemetry.bugs" />

        <SettingsField v-model="value$" field-id="telemetry.dom" />
      </div>
    </section>
  </div>
</template>

<script>
import { VModel } from '~/mixins'

export default {
  mixins: [VModel],
}
</script>

<style lang="scss" scoped>
p {
  @apply mb-4;
}
</style>
