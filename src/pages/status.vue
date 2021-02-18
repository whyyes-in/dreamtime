<template>
  <div class="status">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="rocket" /></span>
        <span>Status</span>
      </h2>

      <h3 class="subtitle">
        Verify that everything is in good condition for nudification.
      </h3>
    </PageHeader>

    <!-- RAM -->
    <AppBox class="requirement">
      <div class="requirement__status" :class="ramStatus" />

      <div class="requirement__description">
        <h4>+8 GB of RAM</h4>
        <h5>Your system has <b>{{ system.memory.total | bytes }}</b> RAM</h5>

        <p v-if="requirements.recommended.ram">
          😁 Nice! You should not have any problem using the application or performing nudifications.
        </p>

        <p v-else-if="usingGPU">
          🤔 You have less RAM than recommended but because you use your GPU for nudification you may not have problems.
        </p>

        <p v-else>
          😓 You have less RAM than recommended and it is very possible that you have problems with the nudification. Please upgrade your RAM.
        </p>
      </div>
    </AppBox>

    <!-- GPU -->
    <AppBox v-if="usingGPU" class="requirement">
      <div class="requirement__status" :class="vramStatus" />

      <div class="requirement__description">
        <h4>+6 GB of VRAM</h4>
        <h5>Your graphics card has <b>{{ (system.primaryGpu.vram * 1000000) | bytes }}</b> VRAM</h5>

        <p v-if="!requirements.recommended.vram">
          😁 Perfect! Your graphics card should be able to perform nudifications without problems.
        </p>

        <p v-else>
          😓 You have less VRAM than recommended and it is very possible that you have problems with the nudification. Please upgrade your GPU <NuxtLink to="/settings/processing">
            or use CPU nudification
          </NuxtLink>.
        </p>
      </div>
    </AppBox>

    <!-- Models folder -->
    <AppBox class="requirement">
      <div class="requirement__status" :class="folderStatus" />

      <div class="requirement__description">
        <h4>Models folder</h4>
        <h5>Folder where nudes are saved, must not contain special characters.</h5>

        <p v-if="requirements.folders.models">
          😁 Very good! The folder where the nudes will be saved has no problems.
        </p>

        <p v-else>
          😓 The folder where the nudes will be saved has special characters or emojis, it is very possible that this may cause errors in the nudification. Please check the <nuxt-link to="/settings/folders">
            settings
          </nuxt-link> and make sure to install DreamTime in a place with no special characters, preferably only English alphabet characters.
        </p>
      </div>
    </AppBox>

    <p class="mb-6">
      In case of problems you have the <a href="https://dreamtime.tech/docs/support/feedback" target="_blank" class="text-primary">help channels</a> at your disposal. 🙂
    </p>

    <hr class="mb-6">

    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="rocket" /></span>
        <span>Other recommendations</span>
      </h2>
    </PageHeader>

    <AppBox title="No special characters" class="requirement">
      <div class="requirement__description">
        <p>The algorithm does not like special characters in general, please make sure to work only with photos and folders that have English alphabet characters preferably.</p>
      </div>
    </AppBox>

    <AppBox title="Disk space" class="requirement">
      <div class="requirement__description">
        <p>As much fun as it is to nudify non-stop some people forget how little storage they have left, this and permission issues are the number one cause of problems when nudifying. Constantly check your disk space!</p>
      </div>
    </AppBox>

    <AppBox title="RTX 3000" class="requirement">
      <div class="requirement__description">
        <p>Support for the new NVIDIA graphics cards is still in the experimental phase. Slow processing speed and errors are to be expected in both DreamPower and Waifu2X.</p>
      </div>
    </AppBox>
  </div>
</template>

<script>
import prettyBytes from 'pretty-bytes'
import { requirements } from '~/modules/system'

const { system } = $provider

export default {
  filters: {
    bytes(value) {
      return prettyBytes(value)
    },
  },

  data: () => ({
    requirements,
    system,
  }),

  computed: {
    usingGPU() {
      return this.$settings.preferences.advanced.device === 'GPU' && system.primaryGpu
    },

    ramStatus() {
      if (requirements.recommended.ram) {
        return {
          'requirement__status--success': true,
        }
      }

      if (this.$settings.processing.device === 'GPU') {
        return {
          'requirement__status--warning': true,
        }
      }

      return {
        'requirement__status--danger': true,
      }
    },

    vramStatus() {
      if (requirements.recommended.vram) {
        return {
          'requirement__status--success': true,
        }
      }

      return {
        'requirement__status--danger': true,
      }
    },

    folderStatus() {
      if (requirements.folders.models) {
        return {
          'requirement__status--success': true,
        }
      }

      return {
        'requirement__status--danger': true,
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.status {

}

.requirement {
  &::v-deep {
    .box__content {
      @apply flex gap-6;
    }
  }
}

.requirement__status {
  @apply rounded-full bg-black;
  width: 50px;
  height: 50px;

  &.requirement__status--success {
    @apply bg-success;
  }

  &.requirement__status--warning {
    @apply bg-warning;
  }

  &.requirement__status--danger {
    @apply bg-danger;
  }
}

.requirement__description {
  @apply flex-1;

  h4 {
    @apply text-lg font-semibold;
  }

  h5 {
    @apply text-xs mb-3;
  }
}
</style>
