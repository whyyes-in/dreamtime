<template>
  <section v-if="!readonly" class="box">
    <div class="box__content">
      <MenuItem
        :description="`Value: <strong>x${value$.size}</strong>`"
        tooltip="**x1** = What the algorithm considers the realistic size for the photo."
        :label="`${label} size`">
        <div v-show="preferencesMode !== 2 || body.runs.mode !== 'randomize' || (body.runs.mode === 'randomize' && !value$.randomize.enabled)">
          <VueSlider v-model="value$.size"
                     :min="min"
                     :max="max"
                     :interval="0.05" />
        </div>
      </MenuItem>

      <MenuItem
        v-if="preferencesMode === 2 && body.runs.mode === 'increase'"
        label="Increase?"
        description="Indicates if this should increase with each run.">
        <div class="checkbox">
          <input :id="label"
                 v-model="value$.progressive"
                 type="checkbox">

          <label :for="label" />
        </div>
      </MenuItem>

      <div v-if="preferencesMode === 2 && body.runs.mode === 'randomize'">
        <MenuItem
          label="Randomize?"
          description="Indicates if this should randomize with each run.">
          <div class="checkbox">
            <input :id="label"
                   v-model="value$.randomize.enabled"
                   type="checkbox">

            <label :for="label" />
          </div>
        </MenuItem>

        <MenuItem
          v-if="preferencesMode === 2 && value$.randomize.enabled"
          label="Random range"
          :description="`Min: ${value$.randomize.min} - Max: ${value$.randomize.max}`">
          <VueSlider
            v-model="randomizeRange"
            :min-range="0.02"
            :min="min"
            :max="max"
            :interval="0.05" />
        </MenuItem>
      </div>
    </div>
  </section>

  <MenuItem
    v-else
    :label="label"
    action-class="preference__list">
    <span class="font-bold">{{ value$.size }}</span>
    <span v-if="value$.randomize.enabled === true">
      Randomized ({{ value$.randomize.min }} - {{ value$.randomize.max }})
    </span>
    <span v-else-if="value$.progressive === true">Progresive</span>
  </MenuItem>
</template>

<script>
import { VModel } from '~/mixins'

export default {
  mixins: [VModel],

  props: {
    label: {
      type: String,
      required: true,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 2,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    preferencesMode: {
      type: Number,
      default: 2,
    },
  },

  computed: {
    randomizeRange: {
      get() {
        return [this.value$.randomize.min, this.value$.randomize.max]
      },
      set(value) {
        const [min, max] = value

        this.value$.randomize.min = min
        this.value$.randomize.max = max
      },
    },

    body() {
      return this.$parent.value$?.body
    },
  },
}
</script>

<style lang="scss" scoped>
.preference__list {
  span {
    @apply text-sm text-center block;
  }
}
</style>
