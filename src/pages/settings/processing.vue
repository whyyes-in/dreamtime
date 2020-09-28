<template>
  <div class="settings-fields">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="cogs" /></span>
        <span>Processing</span>
      </h2>

      <h3 class="subtitle">
        Settings that affect the performance of the nudification algorithm.
      </h3>

      <template v-slot:right>
        <button class="button button--danger" @click="reset()">
          <span>Reset</span>
        </button>
      </template>
    </PageHeader>

    <!-- GPU -->
    <div v-if="$settings.preferences.advanced.device === 'GPU'">
      <div v-if="!requirements.recommended.vram" class="notification notification--warning">
        <span class="icon"><font-awesome-icon icon="exclamation-triangle" /></span>
        <span>Your NVIDIA GPU has low VRAM! It is very possible that the nudification fails.</span>
      </div>
    </div>

    <!-- RAM -->
    <div v-if="!requirements.recommended.ram" class="notification notification--warning">
      <span class="icon"><font-awesome-icon icon="exclamation-triangle" /></span>
      <span>Your system has less than <strong>12 GB</strong> of RAM. It is very possible that the nudification fails.</span>
    </div>

    <AppNotification name="device-change">
      The <strong>device</strong> option is now part of the preferences for each photo. If you already have photos in the queue, you should change the device in those photos too.
    </AppNotification>

    <section class="box">
      <div class="box__content">
        <SettingsField v-if="!isMacOS"
                       v-model="value$"
                       field-id="preferences.advanced.device"
                       ignore-hardcoded />

        <SettingsField v-else
                       field-id="preferences.advanced.device"
                       description="Mac only supports CPU."
                       ignore-hardcoded>
          <select v-model="value$.preferences.advanced.device" class="input" disabled>
            <option value="CPU">
              CPU
            </option>
          </select>
        </SettingsField>

        <SettingsField v-show="value$.preferences.advanced.device === 'GPU'" field-id="processing.gpus">
          <select v-model="value$.processing.gpus[0]" class="input">
            <option v-for="(device, index) in $provider.system.graphics" :key="index" :value="index">
              {{ device.model }}
            </option>
            <option v-for="n in 5"
                    :key="`slot-${n - 1}`"
                    :value="n - 1">
              Slot {{ n - 1 }}
            </option>
          </select>
        </SettingsField>

        <SettingsField field-id="processing.cores" :attrs="{ type: 'number', min: 1, max: $provider.system.cores }" />
      </div>
    </section>
  </div>
</template>

<script>
import { cloneDeep, merge } from 'lodash'
import Swal from 'sweetalert2/dist/sweetalert2'
import { requirements } from '~/modules/system'
import { VModel } from '~/mixins'

export default {
  mixins: [VModel],

  data: () => ({
    requirements,
  }),

  computed: {
    isMacOS() {
      return process.platform === 'darwin'
    },
  },

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
      const settings = cloneDeep($provider.settings._default.processing)

      this.value$.processing = merge(this.value$.processing, settings)

      window.$redirect('/')
    },
  },
}
</script>
