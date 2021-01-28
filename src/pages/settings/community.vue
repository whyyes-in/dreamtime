<template>
  <div class="community">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="users" /></span>
        <span>Community</span>
      </h2>

      <h3 class="subtitle">
        Settings that affect the decentralized community network.
      </h3>

      <template #right>
        <button class="button" @click="$refs.aboutDialog.showModal()">
          <span class="icon"><FontAwesomeIcon icon="question-circle" /></span>
          <span>What is this?</span>
        </button>
      </template>
    </PageHeader>

    <div class="alerts" />

    <section class="box">
      <div class="box__content">
        <SettingsField field-id="community.enabled" />
      </div>
    </section>

    <dialog ref="aboutDialog">
      <AppBox title="Community" photo="photo--community">
        <p>The community section allows DreamTime users to share their creations on a decentralized network. By activating this feature you will have the possibility of:</p>

        <ul>
          <li>📷 <strong>Share your creations with other DreamTime users.</strong> As easy as sharing a photo ID to trusted people so they can save it.</li>
          <li>🌎 <strong>Upload your creation publicly.</strong> The new <code>Community</code> section allows you to upload and view other users creations and vote for the best ones.</li>
          <li>💪 <strong>Keep the project alive.</strong> Optionally you can help other people by donating your bandwith so they can download the components from your IPFS node.</li>
        </ul>

        <hr>

        <p>
          <strong>What is IPFS and the decentralized network?</strong>
        </p>

        <p>
          In easy to understand terms it means that the photos and content shared in the community are transferred from PC to PC (peer-2-peer) instead of a central server, this allows the community to be maintained by the users themselves and avoid censorship. This may sound incredible but keep in mind that it has its disadvantages:
        </p>

        <ul>
          <li>📈 <strong>Storage and bandwith usage.</strong> Since content is stored and shared among users, an increase in the use of your storage and internet bandwith is to be expected.</li>
          <li>💀 <strong>It doesn't always work.</strong> The decentralized network is very large and finding a photo can take time or even fail.</li>
        </ul>

        <hr>

        <p>
          <strong>I want to access the community!</strong>
        </p>

        <p>Just go to the settings and enable it to start your IPFS node, this will give you access to everything else. Please note that activating the community indicates that you accept the following terms:</p>

        <ul>
          <li>🚫 <strong>It is strictly forbidden to upload photos of minors, illicit activities or that are not a fake nude.</strong> Your account will be banned and we may report your information to the authorities.</li>
          <li>👮‍♂️ The person appearing in the fake nude you share must be a public figure or have given you permission to use their photo for this activity.</li>
          <li>🧪 The use of a decentralized network in this type of system is experimental and there could be resets or unavailability.</li>
        </ul>

        <template #footer>
          <div class="box__footer">
            <button class="button button--danger w-full" @click="$refs.aboutDialog.close()">
              Close
            </button>
          </div>
        </template>
      </AppBox>
    </dialog>
  </div>
</template>

<script>
import { VModel } from '~/mixins'

export default {
  mixins: [VModel],
}
</script>

<style lang="scss" scoped>
.community {
  dialog[open] {
    @apply justify-center items-center h-screen;

    &[open] {
      @apply flex;
    }

    .box {
      @apply h-full overflow-auto;
      max-height: 70vh;
    }
  }

  ul {
    @apply list-disc;

    li {
      @apply ml-3;

      &:not(:last-child) {
        @apply mb-2;
      }
    }
  }
}

::v-deep {
  .photo--community {
    background-image: url('~assets/images/undraw/undraw_spread_love_r9jb.svg')
  }
}
</style>
