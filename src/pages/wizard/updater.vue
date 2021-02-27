<template>
  <div class="updater">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="sync" /></span>
        <span>Updater</span>
      </h2>

      <h3 class="subtitle">
        Install or update DreamTime components.
      </h3>

      <template #right>
        <div class="buttons">
          <a href="https://dreamtime.tech/docs/guide/updater" target="_blank" class="button button--info">
            <span class="icon"><FontAwesomeIcon icon="question-circle" /></span>
            <span>Help</span>
          </a>

          <button class="button" @click="$refs.settings.showModal()">
            <span class="icon"><FontAwesomeIcon icon="cog" /></span>
            <span>Settings</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <div class="updater__content">
      <!-- DreamTime -->
      <section class="updater__section">
        <ProjectUpdater name="dreamtime" />
      </section>

      <!-- Required -->
      <section class="updater__section">
        <PageHeader>
          <h2 class="title">
            <span class="icon"><font-awesome-icon icon="exclamation-circle" /></span>
            <span>Primary</span>
          </h2>

          <h3 class="subtitle">
            Components required to use DreamTime.
          </h3>
        </PageHeader>

        <div v-if="!requirements.canNudify" class="notification notification--warning">
          <span class="icon"><font-awesome-icon icon="info-circle" /></span>
          <span>To continue please install this components.</span>
        </div>

        <ProjectUpdater name="dreampower" />
        <ProjectUpdater name="checkpoints" />
      </section>

      <!-- Additional -->
      <section class="updater__section">
        <PageHeader>
          <h2 class="title">
            <span class="icon"><font-awesome-icon icon="cubes" /></span>
            <span>Additional</span>
          </h2>

          <h3 class="subtitle">
            Optional components that offer additional features.
          </h3>
        </PageHeader>

        <ProjectUpdater name="waifu" />
      </section>
    </div>

    <dialog ref="settings" class="dialog">
      <AppBox :title="`Updater Settings`">
        <SettingsField field-id="updater.protocol" />
        <SettingsField field-id="updater.showPasswordProtected" />

        <template #footer>
          <div class="box__footer box__footer--buttons">
            <button class="button flex-1 button--danger" @click="$refs.settings.close()">
              Close
            </button>
          </div>
        </template>
      </AppBox>
    </dialog>
  </div>
</template>

<script>
import { requirements } from '~/modules/system/requirements'

export default {
  layout: () => {
    if (!requirements.canNudify) {
      return 'wizard'
    }

    return undefined
  },

  data: () => ({
    requirements,
  }),
}
</script>

<style lang="scss" scoped>
.updater__section {
  @apply mb-9;
}

.dialog {
  width: 700px;
}
</style>
