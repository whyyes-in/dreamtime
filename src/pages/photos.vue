<template>
  <div class="photos">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="images" /></span>
        <span>Photos</span>
      </h2>

      <h3 class="subtitle">
        The place where you can find all your creations.
      </h3>

      <template v-slot:right>
        <button class="button"
                @click.prevent="openFolder">
          <span class="icon"><font-awesome-icon icon="folder-open" /></span>
          <span>Open Folder</span>
        </button>
      </template>
    </PageHeader>

    <div class="photos__content">
      <Photo v-for="(file, index) in photos"
             :key="index"
             :file="file"
             data-private />
    </div>
  </div>
</template>

<script>
import { photos } from '~/modules'

const { shell } = $provider.api

export default {
  layout: 'layout--wide',

  data: () => ({
    p: photos,
  }),

  computed: {
    photos() {
      return photos.files
    },
  },

  methods: {
    openFolder() {
      shell.openPath(photos.folder)
    },
  },
}
</script>

<style lang="scss" scoped>
.photos {

}

.photos__content {
  @apply grid grid-cols-4 gap-6;

  @screen md {
    @apply grid-cols-3;
  }

  @screen sm {
    @apply grid-cols-2;
  }
}
</style>
