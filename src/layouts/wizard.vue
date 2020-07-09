<template>
  <div class="layout">
    <!-- Title bar -->
    <Titlebar />

    <!-- Content -->
    <div id="layout-content" class="layout__content">
      <div class="container h-full">
        <nuxt />
      </div>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.layout {
  @apply h-full;

  display: grid;
  grid-template-areas: 'title' 'content';
  grid-template-columns: 100%;
  grid-template-rows: 30px 1fr;

  .layout__content {
    @apply relative overflow-hidden overflow-y-auto;
    @apply py-6 px-9;
    grid-area: content;
    height: calc(100vh - 30px);
  }
}
</style>
