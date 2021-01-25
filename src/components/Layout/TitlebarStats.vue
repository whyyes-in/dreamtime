<template>
  <div class="stats">
    <div v-if="system"
         v-tooltip="'RAM Usage.'"
         class="device"
         :class="{ 'device--danger': system.utilizationMemory > 80 }">
      <FontAwesomeIcon icon="memory" />
      {{ system.utilizationMemory }}%
    </div>

    <div v-if="system"
         v-tooltip="'CPU Usage.'"
         class="device"
         :class="{ 'device--danger': system.utilizationCpu > 80 }">
      <FontAwesomeIcon icon="microchip" />
      {{ system.utilizationCpu }}%
    </div>

    <div v-if="gpu"
         v-tooltip="'VRAM Usage. (GPU Memory)'"
         class="device"
         :class="{ 'device--danger': gpu.utilizationMemory > 80 }">
      <FontAwesomeIcon icon="desktop" />
      {{ gpu.utilizationMemory }}%
    </div>

    <div v-if="gpu"
         v-tooltip="'GPU Usage.'"
         class="device"
         :class="{ 'device--danger': gpu.utilizationGpu > 80 }">
      <FontAwesomeIcon icon="running" />
      {{ gpu.utilizationGpu }}%
    </div>
  </div>
</template>

<script>
const { system, settings } = $provider

export default {
  data: () => ({
    gpuEvents: null,
    systemEvents: null,

    gpu: null,
    system: null,
  }),

  mounted() {
    if (settings.payload.preferences.advanced.device === 'GPU') {
      this.gpuEvents = system.observe('gpu', 2500)
      this.gpuEvents.on('change', this.onGpu.bind(this))
    }

    this.systemEvents = system.observe('system', 1500)
    this.systemEvents.on('change', this.onSystem.bind(this))
  },

  beforeDestroy() {
    if (this.gpuEvents) {
      this.gpuEvents.emit('stop')
    }

    if (this.systemEvents) {
      this.systemEvents.emit('stop')
    }
  },

  methods: {
    onGpu(data) {
      this.gpu = data
    },
    onSystem(data) {
      this.system = data
    },
  },
}
</script>

<style lang="scss" scoped>
.stats {
  @apply flex gap-4 justify-center items-center;
}

.device {
  @apply text-sm font-bold select-none;
  transition: color 0.1s linear;

  &.device--danger {
    @apply text-danger;
  }
}
</style>
