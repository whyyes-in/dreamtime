<template>
  <div class="item" :class="cssClass" @click="click">
    <!-- Icon -->
    <slot name="icon">
      <div v-if="icon" class="item__icon">
        <img v-if="isImageIcon" :src="icon">
        <font-awesome-icon v-else :icon="icon" />
      </div>
    </slot>

    <!-- Title & Description -->
    <div v-if="label" class="item__label">
      <div class="item__title">
        <span v-html="label" />
        <AppTip v-if="tooltip" :tooltip="prettyTooltip" />
      </div>

      <slot name="description">
        <span v-if="description" class="item__description" v-html="description" />
      </slot>
    </div>

    <!-- Action -->
    <div v-if="$slots.default" class="item__action" :class="actionClass">
      <slot />
    </div>
  </div>
</template>

<script>
import { isNil, startsWith } from 'lodash'
import MarkdownIt from 'markdown-it'
import { dreamtrack } from '~/modules/services'

const md = new MarkdownIt()

const { shell } = $provider.api

export default {
  props: {
    icon: {
      type: [String, Array],
      default: undefined,
    },

    label: {
      type: String,
      default: undefined,
    },

    description: {
      type: String,
      default: undefined,
    },

    tooltip: {
      type: String,
      default: undefined,
    },

    href: {
      type: String,
      default: undefined,
    },

    isLink: {
      type: Boolean,
      default: false,
    },

    actionClass: {
      type: [String, Object, Array],
      default: '',
    },
  },

  computed: {
    hasIcon() {
      return !isNil(this.icon) || !isNil(this.$slots.icon)
    },

    isImageIcon() {
      return startsWith(this.icon, 'http') || startsWith(this.icon, '/')
    },

    cssClass() {
      return {
        'item--link': !isNil(this.href) || this.isLink,
      }
    },

    prettyTooltip() {
      return md.render(this.tooltip)
    },
  },

  methods: {
    click() {
      this.$emit('click')

      if (!isNil(this.href)) {
        if (startsWith(this.href, '/')) {
          this.$router.push(this.href)
        } else {
          dreamtrack.track('CLICK_LINK', { href: this.href })
          shell.openExternal(this.href)
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.item {
  @apply flex items-center;
  @include transition('background-color');
  min-height: 50px;

  &:not(:last-child) {
    @apply mb-6;
  }

  &.item--active,
  &.item--link:hover {
    @apply bg-menus-light text-white;

    .item__icon, .item__title {
      @apply text-generic-500;
    }
  }

  &.item--link {
    @apply rounded cursor-pointer;
    @include transition('background-color, color');
  }
}

.item__icon {
  @apply mr-2 flex items-center justify-center;
  @apply text-2xl text-generic-500;
  width: 42px;
  min-width: 42px;

  img {
    width: 24px;
    height: 24px;
  }
}

.item__label {
  @apply flex-1 flex flex-col justify-center;
  @apply text-common;

  &:not(:last-child) {
    @apply mr-6;
  }

  .item__title {
    @apply block font-semibold;
  }

  &::v-deep {
    .tip {
      @apply ml-1;
    }
  }

  .item__description {
    @apply block text-xs text-common-dark;
  }
}

.item__action {
  @apply flex-1;

  &.item__action--center {
    @apply flex justify-center items-center;
  }
}
</style>
