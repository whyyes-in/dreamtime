<template>
  <!-- Results -->
  <div class="results">
    <PageHeader v-if="photo.withCustomMasks">
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="mask" /></span>
        <span>Masks</span>
      </h2>

      <h3 class="subtitle">
        Manually generate and improve the algorithm masks.
        <AppTip :tooltip="{ content: tooltip, placement: 'bottom' }" />
      </h3>

      <template v-slot:right>
        <div class="buttons">
          <a class="button button--info" href="https://dreamtime.tech/docs/guide/custom-masks" target="_blank">
            <span class="icon"><font-awesome-icon icon="question-circle" /></span>
            <span>Guide</span>
          </a>

          <button
            class="button"
            @click.prevent="openMasksFolder">
            <span class="icon"><font-awesome-icon icon="folder-open" /></span>
            <span>Masks</span>
          </button>
        </div>
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

    <div v-if="photo.isScaleModeCorrected && !photo.pending" class="notification notification--warning">
      <span class="icon"><font-awesome-icon icon="exclamation-triangle" /></span>
      The <strong>{{ photo.scaleModeName }}</strong> scale method has been selected but the tool has not been used, this will generate lower quality fake nudes. <nuxt-link :to="photo.scaleModeURL">
        Please use the tool
      </nuxt-link>.
    </div>

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
      <NudifyPhotoRun v-for="(run, index) in validRuns"
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

    tooltip() {
      return `- Generate mask by mask by clicking on the green button.<br>
      - The changes you make externally to the masks will be captured in real time.<br>
      - As long as you stay on this page the drag and drop functionality will be limited to the masks box.<br><br>

      Read the guide to better understand this mode.`
    },

    validRuns() {
      return this.photo.runs.filter((item) => !item.isMaskGeneration)
    },
  },

  mounted() {
    if (this.photo.withCustomMasks) {
      this.$store.commit('app/setDragDropEnabled', false)
    }
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
  @apply grid grid-cols-3 gap-6;

  @screen sm {
    @apply grid-cols-2;
  }
}

.results__runs {
  @apply grid grid-cols-2 gap-6;

  @screen sm {
    @apply grid-cols-1;
  }

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
