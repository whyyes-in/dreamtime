<template>
  <div class="box lesson" :class="{ 'lesson--small': small }" @click="$emit('click')">
    <div class="box__photo" :class="[`photo--${lesson.photo}`]" />

    <div class="box__header">
      <span class="title">{{ lesson.title }}</span>
    </div>

    <div class="box__content" v-html="content" />

    <div v-if="!small" class="box__footer text-center">
      <a v-for="(button,key) in lesson.buttons"
         :key="key"
         :href="button.href"
         target="_blank"
         class="button button--sm">
        {{ button.text }}
      </a>
    </div>
  </div>
</template>

<script>
import MarkdownIt from 'markdown-it'
import { truncate } from 'lodash'

const md = new MarkdownIt()

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

      return md.render(content)
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
}

.lesson--small {
  .title {
    @apply text-base;
  }

  &::v-deep .box__content {
    @apply text-xs #{!important};
  }
}

/* purgecss start ignore */
.box__photo {
  @apply bg-contain;

  &.photo--drag {
    @apply bg-menus-dark;
    //background-color: #593C48;
    background-image: url('~assets/images/undraw/undraw_throw_down_ub2l.svg')
  }

  &.photo--tips {
    background-color: #C27091;
    background-image: url('~assets/images/undraw/undraw_depi_wexf.svg')
  }

  &.photo--settings {
    background-color: #C27091;
    background-image: url('~assets/images/undraw/undraw_personal_settings_kihd.svg')
  }

  &.photo--preferences {
    background-color: #607AA9;
    background-image: url('~assets/images/undraw/undraw_making_art_759c.svg')
  }

  &.photo--better-results {
    background-color: #607AA9;
    background-image: url('~assets/images/undraw/undraw_blank_canvas_3rbb.svg')
  }

  &.photo--tips-ads {
    background-color: #506896;
    background-image: url('~assets/images/undraw/undraw_elements_cipa.svg')
  }

  &.photo--preferences-mode {
    background-color: #D9B6C4;
    background-image: url('~assets/images/undraw/undraw_selected_options_42hx.svg')
  }
}
/* purgecss end ignore */
</style>
