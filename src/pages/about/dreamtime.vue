<template>
  <div class="project">
    <!-- Stats -->
    <AppStats />

    <div class="project__content">
      <div class="box">
        <div class="box__header">
          <div class="left">
            <h1 class="title">
              {{ $dreamtime.name }}
            </h1>
            <h2 class="subtitle">
              {{ $dreamtime.description }}
            </h2>
          </div>

          <div class="right">
            <button class="button" @click="$dreamtime.openAppFolder()">
              App Folder
            </button>
          </div>
        </div>

        <div class="box__content">
          <!-- Updater -->
          <AppUpdate :project="$dreamtime" href="/wizard/dreamtime" />

          <MenuItem
            label="Changelog"
            description="Look at the changes that have happened between versions."
            icon="book"
            href="/about/changelog" />

          <!-- Remote navigation -->
          <MenuItem
            v-for="(item, index) in $dreamtime.data.about.navigation"
            :key="index"
            :label="item.label"
            :description="item.description"
            :icon="item.icon"
            :href="item.href" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.project {

}

.project__content {
  .title {
    @apply text-white text-2xl;
  }

  .subtitle {
    @apply text-lg;
  }
}

.box__header {
  @apply grid grid-cols-4 gap-3;

  .left {
    @apply col-span-3;
  }

  .right {
    @apply flex justify-center items-center;
  }
}
</style>
