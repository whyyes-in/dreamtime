<template>
  <div class="changelog">
    <AppBox
      v-for="release in releases"
      :key="release.name"
      :title="release.name"
      :content="release.body" />
  </div>
</template>

<script>
import { take } from 'lodash'
import * as projects from '~/modules/projects'

export default {
  props: {
    project: {
      type: String,
      required: true,
    },

    limit: {
      type: Number,
      default: 5,
    },
  },

  data: () => ({
    data: null,
  }),

  computed: {
    updater() {
      return this.data.updater
    },

    releases() {
      return take(this.updater.releases, this.limit)
    },
  },

  created() {
    // eslint-disable-next-line import/namespace
    this.data = projects[this.project]
  },
}
</script>

<style lang="scss" scoped>
.changelog {
  &::v-deep {
    .box__content {
      h3, h2 {
        @apply text-lg text-white font-semibold mb-3;
      }

      ul {
        @apply list-disc;

        &:not(:last-child) {
          @apply mb-6;
        }

        li {
          @apply text-sm ml-6;

          &:not(:last-child) {
            @apply mb-1;
          }
        }
      }
    }
  }
}
</style>
