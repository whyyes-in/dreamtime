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
.lesson {
  &::v-deep ul {
    @apply list-disc;

    li {
      @apply text-sm ml-3;
    }
  }

  &::v-deep {
    &.lesson--small {
      .title {
        @apply text-base;
      }

      .box__content {
        @apply text-xs #{!important};
      }
    }

    .photo--drag {
      //background-color: #593C48;
      background-image: url('~assets/images/undraw/undraw_throw_down_ub2l.svg')
    }

    .photo--tips {
      //background-color: #C27091;
      background-image: url('~assets/images/undraw/undraw_depi_wexf.svg')
    }

    .photo--settings {
      //background-color: #C27091;
      background-image: url('~assets/images/undraw/undraw_personal_settings_kihd.svg')
    }

    .photo--preferences {
      //background-color: #607AA9;
      background-image: url('~assets/images/undraw/undraw_making_art_759c.svg')
    }

    .photo--better-results {
      //background-color: #607AA9;
      background-image: url('~assets/images/undraw/undraw_blank_canvas_3rbb.svg')
    }

    .photo--tips-ads {
      //background-color: #506896;
      background-image: url('~assets/images/undraw/undraw_elements_cipa.svg')
    }

    .photo--preferences-mode {
      //background-color: #D9B6C4;
      background-image: url('~assets/images/undraw/undraw_selected_options_42hx.svg')
    }

    .photo--videos {
      background-image: url('~assets/images/undraw/undraw_video_files_fu10.svg')
    }
  }
}

/* purgecss start ignore */
.box__photo {
  @apply bg-contain;
}

/* purgecss end ignore */
</style>
