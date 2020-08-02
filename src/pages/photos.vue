<template>
  <div class="photos">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="images" /></span>
        <span>My Photos</span>
      </h2>

      <h3 class="subtitle">
        The place where you can find all your creations.
      </h3>

      <template v-slot:right>
        <button class="button"
                @click.prevent="openFolder">
          <span class="icon"><font-awesome-icon icon="folder-open" /></span>
          <span>Folder</span>
        </button>
      </template>
    </PageHeader>

    <div v-if="photos.length === 0" class="photos__empty">
      <font-awesome-icon icon="cloud-showers-heavy" class="icon" />

      <h2>
        No dreams have been created yet...
      </h2>
    </div>

    <div v-else class="photos__content">
      <Photo v-for="(file, index) in photos"
             :key="index"
             :file="file" />
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

.photos__empty {
  @apply flex flex-col justify-center items-center;
  height: 300px;

  .icon {
    @apply text-6xl text-white mb-4;
  }

  h2 {
    @apply text-2xl;
  }
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
