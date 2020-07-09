<template>
  <div class="wizard-user">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="magic" /></span>
        <span>Setup Wizard</span>
      </h2>

      <h3 class="subtitle">
        Telemetry
      </h3>
    </PageHeader>

    <div class="user__content">
      <section class="telemetry__notice">
        <p>
          DreamNet respects your privacy, <strong>the photos you generate with DreamTime will not leave your computer in any way</strong>, the only information we send to our servers is to generate anonymous statistics or error reports to improve the application.
        </p>

        <p>
          Below you can change the telemetry settings:
        </p>
      </section>

      <div class="wizard__footer">
        <button class="button button--xl" @click="next">
          Continue
        </button>
      </div>

      <div class="telemetry__boxes">
        <AppBox title="Analytics." subtitle="Information to generate anonymous statistics.">
          <ul>
            <li>Operating system.</li>
            <li>Country.</li>
            <li>Important events.</li>
          </ul>

          <SettingsField field-id="user" readonly />
        </AppBox>

        <AppBox title="Bug report." subtitle="Detailed information when a error occurs.">
          <ul>
            <li>Operating system.</li>
            <li>CPU, RAM and GPU.</li>
            <li>User settings.</li>
            <li>Console log.</li>
          </ul>

          <SettingsField field-id="telemetry.bugs" />

          <template v-slot:footer>
            <div class="box__footer">
              <a href="https://i.gyazo.com/30972dbc8c2396b58928b5100a016e2d.png"
                 target="_blank"
                 class="button button--info">Example</a>
            </div>
          </template>
        </AppBox>

        <AppBox title="Session tracking." subtitle="Detailed information on how you use the application.">
          <p>
            This helps us know how we can make the application more accessible, also provides additional data to fix errors.
          </p>

          <ul>
            <li>Operating system.</li>
            <li>Actions.</li>
            <li>Mouse movement inside the application. (Photos and sensitive information are censored.)</li>
            <li>Console log.</li>
          </ul>

          <SettingsField field-id="telemetry.dom" />

          <template v-slot:footer>
            <div class="box__footer">
              <a href="https://link.dreamnet.tech/ipfs/QmQd5LKLVs73et1CvchHkq1J99PssoWfa5zRZD4ayqTrML"
                 target="_blank"
                 class="button button--info">Example</a>
            </div>
          </template>
        </AppBox>
      </div>

      <div class="wizard__footer">
        <button class="button button--xl" @click="next">
          Continue
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { settings } from '~/modules/system'

export default {
  layout: 'wizard',

  middleware({ redirect }) {
    if (settings.wizard.telemetry) {
      redirect('/')
    }
  },

  methods: {
    next() {
      settings.wizard.telemetry = true
      this.$router.push('/')
    },
  },
}
</script>

<style lang="scss" scoped>
.wizard-user {

}

.telemetry__notice {
  p {
    @apply text-lg;

    &:not(:last-child) {
      @apply mb-4;
    }
  }
}

.telemetry__boxes {
  ul {
    @apply list-disc ml-6;
  }

  .item {
    @apply mt-6;
  }
}
</style>
