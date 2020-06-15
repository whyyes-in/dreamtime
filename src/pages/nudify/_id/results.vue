<template>
  <!-- Results -->
  <div class="results">
    <PageHeader v-if="photo.isCustomMasks">
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="mask" /></span>
        <span>Masks & Results</span>
      </h2>

      <h3 class="subtitle">
        Generate and customize the masks to create the fake nude of your dreams.
        <AppTip tooltip="As long as you stay on this page the drag and drop photos functionality will be used to upload the masks." />
      </h3>
    </PageHeader>

    <PageHeader v-else>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="heart" /></span>
        <span>Results</span>
      </h2>

      <h3 class="subtitle">
        Look at the results of the nudification. Was it a good dream?
      </h3>
    </PageHeader>

    <!-- Custom Masks -->
    <section v-if="photo.isCustomMasks" class="results__masks">
      <NudifyMaskPhoto :photo="photo" step="correct" />

      <NudifyMaskPhoto :photo="photo" step="mask" />

      <NudifyMaskPhoto :photo="photo" step="maskref" />

      <NudifyMaskPhoto :photo="photo" step="maskdet" />

      <NudifyMaskPhoto :photo="photo" step="maskfin" />
    </section>

    <!-- Results -->
    <section v-if="photo.started" class="results__runs">
      <NudifyPhotoRun v-for="(run, index) in photo.runs" :key="index" :run="run" />
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
}
</script>

<style lang="scss" scoped>
.results {
  @apply h-full;
}

.results__masks {
  @apply mb-6 grid grid-cols-5 gap-3;
}

.results__runs {
  @apply flex flex-wrap;

  .photo-run {
    @apply w-1/2;

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
