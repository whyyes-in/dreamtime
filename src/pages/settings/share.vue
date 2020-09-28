<template>
  <div class="settings-share">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="share-alt" /></span>
        <span>Share</span>
      </h2>

      <h3 class="subtitle">
        Share or save your photo preferences.
      </h3>
    </PageHeader>

    <!-- Offline -->
    <div v-if="!$dreamtrack.enabled" class="notification notification--warning">
      <h5>
        <span class="icon"><font-awesome-icon icon="exclamation-triangle" /></span>
        <span>Unable to connect to {{ $community.name }} servers.</span>
      </h5>

      <span>
        Please try again later.
      </span>
    </div>

    <div v-if="$dreamtrack.enabled">
      <section class="box">
        <div class="box__header">
          <h2 class="title">
            Export
          </h2>
          <h3 class="subtitle">
            Save your photo preferences in an easy-to-remember ID.
          </h3>
        </div>

        <div class="box__content">
          <div class="share__input">
            <input ref="friendlyID"
                   v-model="friendlyID"
                   placeholder="PID will appear here."
                   class="input"
                   readonly>
          </div>
        </div>

        <div class="box__footer">
          <div class="left">
            <label for="body-preferences">
              <input id="body-preferences" v-model="includeBodyPreferences" type="checkbox"> Include body preferences
            </label>
          </div>

          <div class="right">
            <button class="button" @click="generate">
              Generate PID
            </button>
          </div>
        </div>
      </section>

      <section class="box">
        <div class="box__header">
          <h2 class="title">
            Import
          </h2>
          <h3 class="subtitle">
            Restore your preferences or use someone else's.
          </h3>
        </div>

        <div class="box__content">
          <div class="share__input">
            <input v-model="importFriendlyID"
                   placeholder="Write the PID here."
                   class="input">
          </div>
        </div>

        <div class="box__footer">
          <div class="left" />

          <div class="right">
            <button class="button" @click="review">
              Review
            </button>
          </div>
        </div>
      </section>

      <section v-if="importPreferences" class="box">
        <div class="box__header">
          <h2 class="title">
            Preferences review
          </h2>
          <h3 class="subtitle">
            Are you sure you want to import these preferences?
          </h3>
        </div>

        <div class="box__content">
          <SettingsField v-model="importPreferences" field-id="preferences.mode" readonly />

          <SettingsField v-model="importPreferences" field-id="preferences.advanced.scaleMode" readonly />

          <SettingsField v-model="importPreferences" field-id="preferences.advanced.imageSize" readonly />

          <SettingsField v-model="importPreferences" field-id="preferences.advanced.compress" readonly />

          <SettingsField v-model="importPreferences" field-id="preferences.advanced.useColorPaddingStrip" readonly />

          <SettingsField v-model="importPreferences" field-id="preferences.advanced.useColorTransfer" readonly />

          <SettingsField v-model="importPreferences" field-id="preferences.advanced.waifu.scale" readonly />

          <SettingsField v-model="importPreferences" field-id="preferences.advanced.waifu.denoise" readonly />

          <SettingsField v-model="importPreferences" field-id="preferences.advanced.waifu.tta" readonly />

          <SettingsField v-model="importPreferences" field-id="preferences.advanced.waifu.arch" readonly />

          <SettingsField v-model="importPreferences" field-id="preferences.body.runs.mode" readonly />

          <SettingsField v-model="importPreferences" field-id="preferences.body.runs.count" readonly />

          <SettingsField v-model="importPreferences" field-id="preferences.body.runs.rate" readonly />

          <!-- Boobs -->
          <Preference v-if="importPreferences.body.boobs"
                      v-model="importPreferences.body.boobs"
                      label="Boobs"
                      readonly />

          <!-- Areola -->
          <Preference v-if="importPreferences.body.areola"
                      v-model="importPreferences.body.areola"
                      label="Areola"
                      readonly />

          <!-- Nipple -->
          <Preference v-if="importPreferences.body.nipple"
                      v-model="importPreferences.body.nipple"
                      label="Nipple"
                      readonly />

          <!-- Vagina -->
          <Preference v-if="importPreferences.body.vagina"
                      v-model="importPreferences.body.vagina"
                      label="Vagina"
                      readonly />

          <!-- Pubic Hair -->
          <Preference v-if="importPreferences.body.pubicHair"
                      v-model="importPreferences.body.pubicHair"
                      label="Pubic Hair"
                      readonly />
        </div>

        <div class="box__footer">
          <div class="left" />

          <div class="right">
            <button class="button" @click="reviewImport">
              Import
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { cloneDeep, merge } from 'lodash'
import Swal from 'sweetalert2/dist/sweetalert2'
import { settings } from '~/modules/system'
import { VModel } from '~/mixins'

export default {
  mixins: [VModel],

  data: () => ({
    includeBodyPreferences: true,
    friendlyID: '',

    importFriendlyID: '',
    importPreferences: null,
  }),

  computed: {
    preferences() {
      const payload = cloneDeep(settings.get('preferences'))

      if (!this.includeBodyPreferences) {
        delete payload.body
      }

      return payload
    },
  },

  watch: {
    '$dreamtrack.enabled': {
      immediate: true,
      handler(value) {
        if (value) {
          this.init()
        } else {
          this.shutdown()
        }
      },
    },
  },

  beforeDestroy() {
    this.shutdown()
  },

  methods: {
    init() {
      if (!this.$dreamtrack.enabled) {
        return
      }

      this.$dreamtrack.channel.on('preferencesExport', this.onExport.bind(this))
      this.$dreamtrack.channel.on('preferencesImport', this.onImport.bind(this))
    },

    shutdown() {
      if (!this.$dreamtrack.channel) {
        return
      }

      this.$dreamtrack.channel.off('preferencesExport', this.onExport.bind(this))
      this.$dreamtrack.channel.off('preferencesImport', this.onImport.bind(this))
    },

    onExport(friendlyID) {
      Swal.close()

      this.friendlyID = friendlyID
      this.$refs.friendlyID.focus()
    },

    onImport(preferences) {
      if (!preferences) {
        Swal.fire({
          title: 'Invalid Preferences ID',
          text: 'Please make sure you have written it correctly.',
          icon: 'error',
        })

        return
      }

      Swal.close()

      this.importPreferences = JSON.parse(preferences)
    },

    generate() {
      Swal.fire({
        title: 'Exporting your preferences...',
        text: 'One moment, please.',
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
      })

      try {
        delete this.preferences.advanced.waifu.enabled
        delete this.preferences.advanced.device
      // eslint-disable-next-line no-empty
      } catch (e) { }

      this.$dreamtrack.channel.emit('preferencesExport', this.preferences)
    },

    review() {
      if (this.importFriendlyID.length === 0) {
        Swal.fire({
          title: 'Invalid Preferences ID',
          text: 'Please make sure you have written it correctly.',
          icon: 'error',
        })

        return
      }

      Swal.fire({
        title: 'Searching preferences...',
        text: 'One moment, please.',
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
      })

      this.$dreamtrack.channel.emit('preferencesImport', this.importFriendlyID)
    },

    reviewImport() {
      try {
        delete this.importPreferences.advanced.waifu.enabled
        delete this.importPreferences.advanced.device
      // eslint-disable-next-line no-empty
      } catch (e) { }

      this.value$.preferences = merge(this.value$.preferences, this.importPreferences)

      Swal.fire({
        title: 'Success.',
        text: 'Preferences have been imported.',
        icon: 'success',
      })

      this.importPreferences = null
      this.importFriendlyID = ''
    },
  },
}
</script>

<style lang="scss" scoped>
.share__input {
  @apply mb-6;
}

.box__footer {
  @apply flex items-center gap-3;

  .left {
    @apply flex-1;
  }

  .right {
    @apply flex justify-end;
  }
}
</style>
