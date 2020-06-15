<template>
  <div class="settings-fields">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="bell" /></span>
        <span>Notifications</span>
      </h2>

      <h3 class="subtitle">
        Desktop notification settings.
      </h3>
    </PageHeader>

    <section class="box">
      <div class="box__content">
        <SettingsField v-model="value$" field-id="notifications.run" />

        <SettingsField v-model="value$" field-id="notifications.allRuns" />

        <SettingsField v-model="value$" field-id="notifications.update" />
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
