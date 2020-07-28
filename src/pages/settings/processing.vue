<template>
  <div class="settings-fields">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="cogs" /></span>
        <span>Processing</span>
      </h2>

      <h3 class="subtitle">
        Settings that affect the use of resources for the nudification.
      </h3>
    </PageHeader>

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

        <SettingsField field-id="processing.usePython" />
      </div>
    </section>
  </div>
</template>

<script>
import { VModel } from '~/mixins'

export default {
  mixins: [VModel],

  computed: {
    isMacOS() {
      return process.platform === 'darwin'
    },
  },
}
</script>
