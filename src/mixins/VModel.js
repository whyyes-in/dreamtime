import { cloneDeep, isEqual, isNative } from 'lodash'

/**
 * Helper to handle custom v-model
 * @mixin
 */
export default {
  props: {
    /**
     * @model
     */
    value: {
      default: null,
    },
  },

  data: () => ({
    // Current value, this is the variable that must be changed.
    value$: null,
  }),

  created() {
    // Initial value.
    if (!isNative(this.value)) {
      this.value$ = this.value
    } else {
      this.value$ = cloneDeep(this.value)
    }
  },

  watch: {
    /**
     * Local value changed, update the v-model.
     */
    value$: {
      handler(value) {
        if (isEqual(this.value, value)) {
          return
        }

        // console.log(`value$ -> v-model - ${value}`)

        this.$emit('input', value)
      },
      deep: true,
    },

    /**
     * v-model value changed, update the local value.
     */
    value(value) {
      if (isEqual(this.value$, value)) {
        return
      }

      // console.log(`v-model -> value$ - ${value}`)

      this.value$ = value
    },
  },
}
