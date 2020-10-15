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

      <template #right>
        <button class="button button--danger" @click="reset()">
          <span>Reset</span>
        </button>
      </template>
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
      const settings = cloneDeep($provider.settings._default.notifications)

      this.value$.notifications = merge(this.value$.notifications, settings)

      window.$redirect('/')
    },
  },
}
</script>
