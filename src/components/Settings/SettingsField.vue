<template>
  <MenuItem
    :label="fieldLabel"
    :description="fieldDescription"
    :tooltip="fieldTooltip"
    :data-id="field.id">
    <slot>
      <div v-if="!readonly" class="flex-1">
        <!-- Select -->
        <select v-if="field.input === 'select'"
                v-model="localValue"
                class="input"
                :disabled="disabled"
                v-bind="inputAttrs">
          <option v-for="(option, index) in selectOptions" :key="index" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <!-- Input -->
        <input v-if="field.input === 'input'"
               v-model="localValue"
               class="input"
               :disabled="disabled"
               v-bind="inputAttrs">
      </div>

      <span v-else>{{ valueLabel }}</span>
    </slot>
  </MenuItem>
</template>

<script>
import {
  get, set, find, isObject,
} from 'lodash'
import { VModel } from '~/mixins'

export default {
  mixins: [VModel],

  props: {
    fieldId: {
      type: String,
      required: true,
    },

    label: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: null,
    },

    tooltip: {
      type: String,
      default: null,
    },

    options: {
      type: Array,
      default: null,
    },

    optionsField: {
      type: String,
      default: 'options',
    },

    attrs: {
      type: Object,
      default: null,
    },

    readonly: {
      type: Boolean,
      default: false,
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    ignoreHardcoded: {
      type: Boolean,
      defalt: false,
    },
  },

  data: () => ({
    localValue: null,
    field: null,
    firstWatchIgnored: false,
  }),

  computed: {
    selectOptions() {
      if (this.options) {
        return this.options
      }

      return this.field[this.optionsField]
    },

    valueLabel() {
      if (this.field.input === 'select') {
        const option = find(this.selectOptions, { value: this.localValue })
        return option.label
      }

      return this.localValue
    },

    localFieldId() {
      let fieldId = this.field.id

      // FIXME: HARD CODED!
      if (!this.ignoreHardcoded && fieldId.includes('preferences.')) {
        fieldId = fieldId.substring('preferences.'.length)
      }

      return fieldId
    },

    fieldLabel() {
      if (this.label) {
        return this.label
      }

      return this.field.label
    },

    fieldDescription() {
      if (this.description) {
        return this.description
      }

      return this.field.description
    },

    fieldTooltip() {
      if (this.tooltip) {
        return this.tooltip
      }

      return this.field.tooltip
    },

    inputAttrs() {
      if (this.attrs) {
        return this.attrs
      }

      return this.field.attrs || {}
    },
  },

  watch: {
    localValue(value) {
      if (!this.firstWatchIgnored) {
        this.firstWatchIgnored = true
        return
      }

      if (this.readonly || this.disabled) {
        return
      }

      if (this.value$ && !isObject(this.value$)) {
        console.warn('Saving has been prevented because value$ is not an object.')
        return
      }

      if (this.value$) {
        this.value$ = set(this.value$, this.localFieldId, value)
      } else {
        this.$settings.set(this.field.id, value)
      }

      this.$emit('change')
    },
  },

  created() {
    this.field = this.$settings.getField(this.fieldId)

    if (!this.field) {
      throw new Error(`Invalid field ID: ${this.fieldId}`)
    }

    if (isObject(this.value)) {
      this.localValue = get(this.value, this.localFieldId)
    } else if (this.value) {
      this.localValue = this.value
    } else {
      this.localValue = this.$settings.get(this.fieldId)
    }
  },
}
</script>

<style lang="scss" scoped>
.item {
  &::v-deep {
    .item__action {
      @apply flex items-center justify-center;
      //max-width: 300px;
    }
  }
}
</style>
