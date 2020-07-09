<template>
  <div class="project">
    <div class="project__content">
      <div class="box">
        <div class="box__header">
          <div class="left">
            <h1 class="title">
              {{ $waifu.name }}
            </h1>
            <h2 class="subtitle">
              {{ $waifu.description }}
            </h2>
          </div>

          <div class="right">
            <button v-if="requirements.canUseWaifu" class="button" @click="$waifu.openAppFolder()">
              App Folder
            </button>

            <nuxt-link v-else to="/wizard/waifu" class="button button--info">
              Install
            </nuxt-link>
          </div>
        </div>

        <div class="box__content">
          <!-- Updater -->
          <AppUpdate :project="$waifu" href="/wizard/waifu" />

          <!-- Remote navigation -->
          <MenuItem
            v-for="(item, index) in $waifu.data.about.navigation"
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
import { requirements } from '~/modules/system'

export default {
  data: () => ({
    requirements,
  }),
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
