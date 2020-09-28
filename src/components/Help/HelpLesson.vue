<template>
  <AppBox class="lesson"
          :class="{ 'lesson--small': small }"
          :photo="`photo--${lesson.photo}`"
          :title="lesson.title"
          :content="content"
          @click="$emit('click')">
    <template v-slot:footer>
      <div v-if="!small" class="box__footer text-center">
        <a v-for="(button,key) in lesson.buttons"
           :key="key"
           :href="button.href"
           :data-href="button.href"
           target="_blank"
           class="button button--sm"
           @click="onButtonClick">
          {{ button.text }}
        </a>
      </div>
    </template>
  </AppBox>
</template>

<script>
import { truncate, startsWith } from 'lodash'

export default {
  props: {
    lesson: {
      type: Object,
      required: true,
    },

    small: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    content() {
      let content

      if (this.small) {
        content = this.lesson.summary || truncate(this.lesson.content, { length: 80 })
      } else {
        content = this.lesson.content
      }

      return content
    },
  },

  methods: {
    onButtonClick(event) {
      if (startsWith(event.srcElement.dataset.href, '/')) {
        event.preventDefault()
        this.$router.push(event.srcElement.dataset.href)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
/* purgecss start ignore */
.lesson {
  &::v-deep {
    &.lesson--small {
      .title {
        @apply text-base;
      }

      .box__content {
        @apply text-xs #{!important};
      }

      .box__photo {
        height: 130px;
      }
    }

    ul {
      @apply list-disc;

      li {
        @apply text-sm ml-3;
      }
    }

    code {
      @apply mx-1 p-1 bg-gray-800;
    }

    .box__photo {
      height: 180px;
    }

    .box__content {
      @apply pt-3;
    }

    .photo--drag {
      background-image: url('~assets/images/undraw/undraw_throw_down_ub2l.svg')
    }

    .photo--tips {
      background-image: url('~assets/images/undraw/undraw_depi_wexf.svg')
    }

    .photo--settings {
      background-image: url('~assets/images/undraw/undraw_personal_settings_kihd.svg')
    }

    .photo--preferences {
      background-image: url('~assets/images/undraw/undraw_female_avatar_w3jk.svg')
    }

    .photo--better-results {
      background-image: url('~assets/images/undraw/undraw_blank_canvas_3rbb.svg')
    }

    .photo--tips-ads {
      background-image: url('~assets/images/undraw/undraw_elements_cipa.svg')
    }

    .photo--preferences-mode {
      background-image: url('~assets/images/undraw/undraw_selected_options_42hx.svg')
    }

    .photo--videos {
      background-image: url('~assets/images/undraw/undraw_video_files_fu10.svg')
    }

    .photo--masks {
      background-image: url('~assets/images/undraw/undraw_making_art_759c.svg')
    }

    .photo--support {
      background-image: url('~assets/images/undraw/undraw_active_support_6rwo.svg')
    }
  }
}

.box__footer {
  .button {
    @apply mr-2;
  }
}
/* purgecss end ignore */
</style>
