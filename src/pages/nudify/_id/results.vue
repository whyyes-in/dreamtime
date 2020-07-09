<template>
  <!-- Results -->
  <div class="results">
    <PageHeader v-if="photo.withCustomMasks">
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="mask" /></span>
        <span>Masks</span>
      </h2>

      <h3 class="subtitle">
        Generate and customize the masks to create the nude of your dreams.
        <AppTip :tooltip="{ content: 'As long as you stay on this page the drag and drop functionality will be limited to masks.', placement: 'bottom' }" />
      </h3>

      <template v-slot:right>
        <button v-tooltip="{ content: 'Open the folder where the masks are stored.<br><br>The changes you make externally in the files will be reflected in real time here.', placement: 'bottom' }"
                class="button"
                @click.prevent="openMasksFolder">
          <span class="icon"><font-awesome-icon icon="folder-open" /></span>
          <span>Masks</span>
        </button>
      </template>
    </PageHeader>

    <PageHeader v-else>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="heart" /></span>
        <span>Results</span>
      </h2>

      <h3 class="subtitle">
        Look at the results of the nudification. Sweet Dreams!
      </h3>

      <template v-slot:right>
        <button v-tooltip="{ content: 'Open the folder where the results are stored.', placement: 'bottom' }"
                class="button"
                @click.prevent="openFolder">
          <span class="icon"><font-awesome-icon icon="folder-open" /></span>
          <span>Folder</span>
        </button>
      </template>
    </PageHeader>

    <!-- Custom Masks -->
    <section v-if="photo.withCustomMasks" class="results__masks">
      <NudifyMaskPhoto :mask="photo.masks.correct" />

      <NudifyMaskPhoto :mask="photo.masks.mask" />

      <NudifyMaskPhoto :mask="photo.masks.maskref" />

      <NudifyMaskPhoto :mask="photo.masks.maskdet" />

      <NudifyMaskPhoto :mask="photo.masks.maskfin" />

      <NudifyMaskPhoto :mask="photo.masks.nude" />

      <NudifyMaskPhoto v-show="photo.scaleMode === 'overlay'" :mask="photo.masks.overlay" />

      <NudifyMaskPhoto v-show="photo.useColorPaddingRemoval" :mask="photo.masks.padding" />

      <NudifyMaskPhoto v-show="photo.useUpscaling" :mask="photo.masks.scale" />
    </section>

    <!-- Results -->
    <section v-else-if="photo.started" class="results__runs">
      <NudifyPhotoRun v-for="(run, index) in photo.runs"
                      :key="index"
                      :run="run" />
    </section>

    <!-- Waiting -->
    <section v-else-if="photo.waiting" class="results__status">
      <font-awesome-icon icon="cloud-sun-rain" class="icon" />

      <h2>
        Waiting for other dreams to complete...
      </h2>
    </section>

    <!-- Pending -->
    <section v-else class="results__status">
      <font-awesome-icon icon="cloud-moon" class="icon" />

      <h2>
        Add me to the queue and let's dream together.
      </h2>
    </section>
  </div>
</template>

<script>
const { shell } = $provider.api

export default {
  layout: 'layout--wide',

  computed: {
    photo() {
      return this.$parent.photo
    },

    /**
     *
     */
    preferences() {
      return this.photo.preferences
    },
  },

  mounted() {
    this.$store.commit('app/setDragDropEnabled', false)
  },

  methods: {
    openMasksFolder() {
      shell.openPath(this.photo.getFilesPath())
    },

    openFolder() {
      shell.openPath(this.photo.getFolderPath())
    },
  },
}
</script>

<style lang="scss" scoped>
.results {
  @apply h-full;
}

.results__masks {
  @apply grid grid-cols-6 gap-6;

  .mask {
    @apply col-span-2;
  }
}

.results__runs {
  @apply grid grid-cols-2 gap-6;

  .run {
    @media (min-height: 1280px) {
      height: 1024px;
    }
  }
}

.results__status {
  @apply flex flex-col justify-center items-center;
  height: 300px;

  .icon {
    @apply text-6xl text-white mb-4;
  }

  h2 {
    @apply text-2xl;
  }
}
</style>
