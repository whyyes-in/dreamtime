<template>
  <section v-if="!readonly" class="box">
    <div class="box__content">
      <MenuItem :description="`Value: ${value$.size}`" :label="`${label} size`">
        <div v-if="body.runs.mode === false">
          <VueSlider v-model="value$.size"
                     :min="min"
                     :max="max"
                     :interval="0.05" />
        </div>
      </MenuItem>

      <MenuItem
        v-if="body.runs.mode === 'increase'"
        label="Increase?"
        description="Indicates if this should increase with each run.">
        <select v-model="value$.progressive" class="input">
          <option :value="true">
            Enabled
          </option>
          <option :value="false">
            Disabled
          </option>
        </select>
      </MenuItem>

      <div v-if="body.runs.mode === 'randomize'">
        <MenuItem
          label="Randomize?"
          description="Randomize this body part in each run.">
          <select v-model="value$.randomize.enabled"
                  class="input">
            <option :value="true">
              Enabled
            </option>
            <option :value="false">
              Disabled
            </option>
          </select>
        </MenuItem>

        <MenuItem
          label="Random range"
          :description="`Min: ${value$.randomize.min} - Max: ${value$.randomize.max}`">
          <VueSlider
            v-model="randomizeRange"
            :min-range="0.05"
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
      default: 0.3,
    },
    max: {
      type: Number,
      default: 2,
    },
    readonly: {
      type: Boolean,
      default: false,
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
