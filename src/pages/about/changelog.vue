<template>
  <div class="changelog">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="book" /></span>
        <span>{{ $dreamtime.name }} Changelog</span>
      </h2>
    </PageHeader>

    <AppBox
      v-for="release in releases"
      :key="release.name"
      :title="release.name"
      :content="release.body" />
  </div>
</template>

<script>
import { take } from 'lodash'

export default {
  computed: {
    releases() {
      return take(this.$dreamtime.updater.releases, 5)
    },
  },
}
</script>

<style lang="scss" scoped>
.changelog {

  &::v-deep {
    h3 {
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
</style>
