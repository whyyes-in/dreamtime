<template>
  <div class="tos">
    <PageHeader>
      <h2 class="title">
        <span class="icon"><font-awesome-icon icon="magic" /></span>
        <span>Setup Wizard</span>
      </h2>

      <h3 class="subtitle">
        Information you should know before starting.
      </h3>
    </PageHeader>

    <div class="tos__content">
      <AppBox v-for="(item, index) in tos"
              :key="index"
              :photo="item.photo"
              :title="item.title"
              :content="item.content" />
    </div>

    <div class="wizard__footer">
      <button class="button button--xl" @click="next">
        Understood
      </button>
    </div>
  </div>
</template>

<script>
import tos from '~/modules/config/tos.yml'

export default {
  layout: 'wizard',

  data: () => ({
    tos,
  }),

  methods: {
    next() {
      this.$settings.wizard.tos = true
      this.$router.push('/wizard/power')
    },
  },
}
</script>

<style lang="scss" scoped>
/* purgecss start ignore */
.tos {
  &::v-deep {
    .box__photo {
      height: 160px;
    }

    .tos--adults {
      background-image: url('~@/assets/images/undraw/undraw_depi_wexf.svg')
    }

    .tos--opensource {
      background-image: url('~@/assets/images/undraw/undraw_open_source_1qxw.svg');
    }

    .tos--legal {
      background-image: url('~@/assets/images/undraw/undraw_judge_katerina_limpitsouni_ny1q.svg');
    }

    .tos--share {
      background-image: url('~@/assets/images/undraw/undraw_cancel_u1it.svg');
    }

    .tos--license {
      background-image: url('~@/assets/images/undraw/undraw_terms_lso0.svg');
    }

    .tos--love {
      background-image: url('~@/assets/images/undraw/undraw_Appreciation_sjc1.svg');
    }
  }
}

.tos__content {
  @apply grid grid-cols-2 gap-6;
}
/* purgecss end ignore */
</style>
