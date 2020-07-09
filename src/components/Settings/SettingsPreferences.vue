<template>
  <div class="preferences">
    <!-- Basics -->
    <section id="preferences-basics" class="box">
      <div class="box__content">
        <SettingsField v-model="value$" field-id="preferences.mode" :options-field="optionsField" />

        <SettingsField v-if="value$.mode > 0"
                       v-model="value$"
                       field-id="preferences.advanced.scaleMode"
                       :options-field="optionsField" />
      </div>
    </section>

    <!-- Boobs -->
    <Preference id="preferences-body"
                v-model="value$.body.boobs"
                label="Boobs"
                :min="0" />

    <!-- Areola -->
    <Preference v-model="value$.body.areola"
                label="Areola"
                :min="0" />

    <!-- Nipple -->
    <Preference v-model="value$.body.nipple"
                label="Nipple"
                :min="0" />

    <!-- Vagina -->
    <Preference v-model="value$.body.vagina"
                label="Vagina"
                :max="1.5" />

    <!-- Pubic Hair -->
    <Preference v-model="value$.body.pubicHair"
                label="Pubic Hair"
                :min="0" />

    <!-- Runs -->
    <section v-if="value$.mode === 2" id="preferences-runs" class="box">
      <div class="box__header">
        <h2 class="title">
          Per run.
        </h2>
        <h3 class="subtitle">
          Customize what will happen each run.
          <AppTip tooltip="The runs allow you to nudify the same photo with different preferences." />
        </h3>
      </div>

      <div class="box__content">
        <SettingsField v-model="value$" field-id="preferences.body.executions" />

        <SettingsField v-model="value$" field-id="preferences.body.randomize" />

        <SettingsField v-model="value$"
                       field-id="preferences.body.progressive.enabled"
                       :description="`Body preferences will increase ${value$.body.progressive.rate} at each run.`" />

        <SettingsField v-if="!value$.body.randomize && value$.body.progressive.enabled"
                       v-model="value$"
                       field-id="preferences.body.progressive.rate"
                       :description="`Value: ${value$.body.progressive.rate}`" />
      </div>
    </section>

    <!-- Advanced -->
    <section v-if="value$.mode > 1" id="preferences-advanced" class="box">
      <div class="box__header">
        <h2 class="title">
          Advanced.
        </h2>
        <h3 class="subtitle">
          Additional processing settings.
        </h3>
      </div>

      <div class="box__content">
        <SettingsField v-show="value$.advanced.scaleMode === 'padding'" v-model="value$" field-id="preferences.advanced.useColorPaddingStrip" />

        <SettingsField v-model="value$" field-id="preferences.advanced.useColorTransfer" />
      </div>
    </section>

    <!-- Waifu2X -->
    <section v-if="value$.mode > 1 && !animated" class="box">
      <div class="box__header">
        <h2 class="title">
          Waifu2X.
        </h2>
        <h3 class="subtitle">
          Settings for the upscale and denoise algorithm.
        </h3>
      </div>

      <div v-if="requirements.canUseWaifu" class="box__content">
        <SettingsField v-model="value$" field-id="preferences.advanced.waifu.enabled" />

        <div v-if="value$.advanced.waifu.enabled">
          <SettingsField v-model="value$" field-id="preferences.advanced.waifu.scale" />
          <SettingsField v-model="value$" field-id="preferences.advanced.waifu.denoise" />
          <SettingsField v-model="value$" field-id="preferences.advanced.waifu.tta" />
          <SettingsField v-model="value$" field-id="preferences.advanced.waifu.arch" />
        </div>
      </div>

      <div v-else class="box__content">
        <nuxt-link to="/wizard/waifu" class="underline">
          Install Waifu2X to use this feature.
        </nuxt-link>
      </div>
    </section>
  </div>
</template>

<script>
import { tutorial } from '~/modules'
import { requirements } from '~/modules/system'
import { VModel } from '~/mixins'

export default {
  mixins: [VModel],

  props: {
    animated: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    requirements,
  }),

  computed: {
    optionsField() {
      return this.animated ? 'animated-options' : 'options'
    },
  },

  mounted() {
    tutorial.preferences()
  },
}
</script>

<style lang="scss" scoped>
.preferences {
  &::v-deep {
    .box .box__header {
      @apply pt-6;
    }
  }
}
</style>
