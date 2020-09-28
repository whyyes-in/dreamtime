<template>
  <div v-if="photo" class="nudify">
    <!-- Menu -->
    <portal to="menu">
      <!-- Original Preview -->
      <section class="nudify__photo">
        <NudifyPhotoPreview :photo="photo" />
      </section>

      <!-- Menu -->
      <section class="menu__items">
        <MenuItem
          label="Photo Preferences"
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
          v-show="photo.canShowPaddingTool"
          label="Color Padding"
          icon="compress-arrows-alt"
          :href="`/nudify/${photo.id}/padding`" />

        <MenuItem
          v-show="!photo.withCustomMasks"
          label="Results"
          icon="heart"
          :href="`/nudify/${photo.id}/results`" />

        <MenuItem
          v-show="photo.withCustomMasks"
          label="Masks"
          icon="mask"
          :href="`/nudify/${photo.id}/results`" />
      </section>

      <!-- Buttons -->
      <section class="nudify__buttons">
        <!-- Nudify -->
        <button
          v-if="!photo.running && !photo.waiting && !photo.withCustomMasks"
          id="nudify-nudify"
          key="nudify"
          v-tooltip="{content: 'Add the photo to the queue.', placement: 'right'}"
          class="button button--lg button--success"
          @click.prevent="add">
          <span class="icon"><font-awesome-icon icon="play" /></span>
          <span>Nudify</span>
        </button>

        <!-- Save all -->
        <button
          v-if="photo.finished && photo.runsCount > 1"
          key="save-all"
          v-tooltip="{content: 'Save all the fake nudes.', placement: 'right'}"
          class="button button--info"
          @click.prevent="saveAll">
          <span class="icon"><font-awesome-icon icon="save" /></span>
          <span>Save all</span>
        </button>

        <!-- Remove from queue-->
        <button
          v-if="photo.waiting"
          key="cancel"
          v-tooltip="{content: 'Remove the photo from the queue.', placement: 'right'}"
          class="button button--danger"
          @click.prevent="cancel">
          <span class="icon"><font-awesome-icon icon="sign-out-alt" /></span>
          <span>Cancel</span>
        </button>

        <!-- Stop -->
        <button
          v-if="photo.running"
          key="stop"
          class="button button--danger"
          @click.prevent="stop">
          <span class="icon"><font-awesome-icon icon="stop" /></span>
          <span>Stop</span>
        </button>

        <!-- Forget -->
        <button
          id="nudify-forget"
          v-tooltip="{
            content: 'Remove the photo from the application and free up memory. (Fake nudes files will not be removed)',
            placement: 'right',
            boundary: 'viewport'}"
          class="button"
          @click.prevent="forget">
          <span class="icon"><font-awesome-icon icon="trash-alt" /></span>
          <span>Remove</span>
        </button>
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
  background-image: url('~@/assets/images/repeated-square-dark.png');
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
  .button {
    @apply w-full mb-6;
  }
}
</style>
