<template>
  <div v-if="photo" class="nudify">
    <!-- Menu -->
    <portal to="menu">
      <section class="nudify__buttons">
        <!-- Nudify -->
        <button
          v-show="!photo.running && !photo.waiting"
          id="nudify-nudify"
          v-tooltip="{content: 'Add the photo to the queue to be nudified as soon as it is turn.', placement: 'right', boundary: 'viewport'}"
          class="button button--lg button--success"
          @click.prevent="add">
          <span class="icon"><font-awesome-icon icon="play" /></span>
          <span>Nudify</span>
        </button>

        <!-- Save all -->
        <button
          v-show="photo.finished && photo.executions > 1"
          v-tooltip="{content: 'Save all the photos generated in the location you select.', placement: 'right', boundary: 'viewport'}"
          class="button button--info"
          @click.prevent="saveAll">
          <span class="icon"><font-awesome-icon icon="save" /></span>
          <span>Save all</span>
        </button>

        <!-- Remove from queue-->
        <button
          v-show="photo.waiting"
          class="button button--danger"
          @click.prevent="cancel">
          <span>Remove from queue</span>
        </button>

        <!-- Stop -->
        <button
          v-show="photo.running"
          class="button button--danger"
          @click.prevent="stop">
          <span class="icon"><font-awesome-icon icon="stop" /></span>
          <span>Stop</span>
        </button>

        <!-- Forget -->
        <button
          id="nudify-forget"
          v-tooltip="{
            content: 'Free memory by removing the photo from the application. (Nudified photos will not be deleted)',
            placement: 'right',
            boundary: 'viewport'}"
          class="button button--danger"
          @click.prevent="forget">
          <span class="icon"><font-awesome-icon icon="trash-alt" /></span>
          <span>Forget</span>
        </button>
      </section>

      <!-- Original Preview -->
      <section class="nudify__photo">
        <div class="nudify__photo__preview"
             :style="{ backgroundImage: `url('${photo.file.path}')` }" />

        <img v-tooltip="photo.avatar.name" :src="photo.avatar.image" class="nudify__photo__badge">
      </section>

      <!-- Menu -->
      <section class="menu__items">
        <MenuItem
          label="Preferences"
          icon="sliders-h"
          :href="`/nudify/${photo.id}/preferences`" />

        <MenuItem
          v-show="photo.canShowEditor"
          label="Editor"
          icon="paint-brush"
          :href="`/nudify/${photo.id}/editor`" />

        <MenuItem
          v-show="photo.canShowCropTool"
          label="Crop"
          icon="crop"
          :href="`/nudify/${photo.id}/crop`" />

        <MenuItem
          v-show="photo.canShowOverlayTool"
          label="Overlay"
          icon="magic"
          :href="`/nudify/${photo.id}/overlay`" />

        <MenuItem
          v-show="!photo.isCustomMasks"
          label="Results"
          icon="heart"
          :href="`/nudify/${photo.id}/results`" />

        <MenuItem
          v-show="photo.isCustomMasks"
          label="Masks & Results"
          icon="mask"
          :href="`/nudify/${photo.id}/results`" />
      </section>
    </portal>

    <nuxt-child keep-alive />
  </div>
</template>

<script>
import { isNil } from 'lodash'
import { Nudify } from '~/modules/nudify'
import { tutorial } from '~/modules'

export default {
  middleware: ({ route, redirect }) => {
    const { params, fullPath } = route

    if (isNil(params.id)) {
      redirect('/')
      return
    }

    const photo = Nudify.getPhotoById(params.id)

    if (isNil(photo)) {
      redirect('/')
      return
    }

    if (fullPath === `/nudify/${params.id}`) {
      if (photo.running || photo.finished) {
        redirect(`/nudify/${params.id}/results`)
      } else {
        redirect(`/nudify/${params.id}/preferences`)
      }
    }
  },

  data: () => ({
    photo: null,
  }),

  created() {
    const { params } = this.$route
    this.photo = Nudify.getPhotoById(params.id)
  },

  mounted() {
    tutorial.photo()
  },

  methods: {
    add() {
      this.photo.add()
      this.$router.push(`/nudify/${this.photo.id}/results`)
    },

    cancel() {
      this.photo.cancel()
    },

    stop() {
      this.photo.cancel()
    },

    saveAll() {
      this.photo.saveAll()
    },

    openFolder() {
      this.photo.openFolder()
    },

    forget() {
      this.$router.push('/')
      this.photo.forget()
    },
  },
}
</script>

<style lang="scss" scoped>
.nudify {
  @apply relative h-full;
}

.nudify__photo {
  @apply relative rounded;
  background-image: url('~@/assets/images/curls.png');
  will-change: transform;
  height: 250px;
}

.nudify__photo__preview {
  @apply absolute top-0 bottom-0 left-0 right-0 z-10;
  @apply bg-contain bg-no-repeat bg-center;
}

.nudify__photo__badge {
  @apply absolute z-20;
  top: 5px;
  right: 5px;
  width: 40px;
  height: 40px;
}

.nudify__buttons {
  @apply flex;

  .button {
    @apply w-full rounded-none;

    &:first-child {
      @apply rounded-tl rounded-bl;
    }

    &:last-child {
      @apply rounded-tr rounded-br;
    }
  }
}
</style>
