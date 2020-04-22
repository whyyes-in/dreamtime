<template>
  <div
    ref="layout"
    class="layout"
    :class="{
      'layout--dragging': isDragging,
      'layout--left-queue': $settings.app.queuePosition === 'left'
    }"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop">
    <!-- Title bar -->
    <Titlebar />

    <!-- Navigation -->
    <Navbar />

    <!-- Menu -->
    <Menubar />

    <!-- Queue -->
    <Queuebar />

    <!-- Content -->
    <div id="layout-content"
         class="layout__content">
      <nuxt />
    </div>

    <!-- Dragging -->
    <div class="layout__dropzone">
      <h2>Drop the dream here!</h2>
    </div>
  </div>
</template>

<script>
import { wrapGrid } from 'animate-css-grid'
import { UploadMixin } from '~/mixins'

export default {
  middleware: ['wizard'],

  mixins: [UploadMixin],

  mounted() {
    wrapGrid(this.$refs.layout)
  },
}
</script>

<style lang="scss" scoped>
.layout {
  @apply h-full;

  display: grid;
  grid-template-areas: 'title title title' 'nav nav nav' 'menu content queue';
  grid-template-columns: 250px 1fr 250px;
  grid-template-rows: 30px 50px 1fr;

  &.layout--dragging {
    .layout__dropzone {
      @apply flex opacity-100;
    }
  }

  .layout__topbar {
    height: 30px;
  }

  .layout__navbar {
    height: 50px;
  }

  .layout__jobbar {

  }

  .layout__content {
    @apply relative overflow-hidden overflow-y-auto;
    @apply py-6 px-9;
    grid-area: content;
    height: calc(100vh - 80px);
  }

  .layout__dropzone {
    @apply absolute left-0 right-0 top-0 bottom-0 z-50;
    @apply hidden opacity-0 pointer-events-none;
    @apply bg-dark-900-70 items-center justify-center;
    backdrop-filter: blur(6px);
    transition: opacity 0.2s ease-in-out;
    will-change: opacity;

    h2 {
      @apply text-white font-bold text-3xl;
    }
  }
}
</style>
