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

      <template #right>
        <button class="button button--danger" @click="reset()">
          <span>Reset</span>
        </button>
      </template>
    </PageHeader>

    <div class="notification">
      <span class="icon"><font-awesome-icon icon="info-circle" /></span>
      <span>Changing this options needs a restart to take effect.</span>
    </div>

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
import { cloneDeep, merge } from 'lodash'
import Swal from 'sweetalert2/dist/sweetalert2'
import { VModel } from '~/mixins'

export default {
  mixins: [VModel],

  methods: {
    async reset() {
      const response = await Swal.fire({
        title: 'Are you sure?',
        text: 'This will set all options in this section to their default values.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#F44336',
        confirmButtonText: 'Yes',
      })

      if (!response.value) {
        return
      }

      // eslint-disable-next-line no-underscore-dangle
      const settings = cloneDeep($provider.settings._default.telemetry)

      this.value$.telemetry = merge(this.value$.telemetry, settings)

      window.$redirect('/')
    },
  },
}
</script>

<style lang="scss" scoped>
p {
  @apply mb-4;
}
</style>
