<template>
  <div v-tooltip="photo.avatar.name" class="badge" :style="{ backgroundColor: color }">
    {{ letter }}
  </div>
</template>

<script>
export default {
  props: {
    photo: {
      type: Object,
      required: true,
    },
  },

  computed: {
    color() {
      return this.photo.avatar.color
    },

    letter() {
      return this.photo.avatar.name[0]
    },
  },
}
</script>

<style lang="scss" scoped>
.badge {
  @apply flex justify-center items-center;
  @apply rounded-full text-lg font-bold text-white;
  -webkit-text-stroke: 1px black;
  width: 30px;
  height: 30px;
}
</style>
