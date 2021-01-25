<template>
  <div id="uploader" class="uploader" />
</template>

<script>
import {
  Core, Dashboard, Dropbox, GoogleDrive, Url, ImageEditor,
} from 'uppy'
import InstagramUrl from '@dreamnet/puppy-instagram-url'

import 'uppy/dist/uppy.min.css'

export default {
  mounted() {
    this.$store.commit('app/setDragDropEnabled', false)

    const uppy = Core({
      debug: true,
      restrictions: {
        maxNumberOfFiles: 100,
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'],
      },
    })
      .use(Dashboard, {
        target: '#uploader',
        inline: true,
        note: 'PNG, JPG, GIF, MP4 and WEBM files only.',
        theme: 'dark',
        showLinkToFileUploadResult: false,
        hideProgressAfterFinish: true,
        width: '100%',
        height: '100%',
      })
      .use(Dropbox, {
        target: Dashboard,
        companionUrl: 'http://localhost:13020',
        title: 'My Dropbox',
      })
      .use(GoogleDrive, {
        target: Dashboard,
        companionUrl: 'http://localhost:13020',
        title: 'My Google Drive',
      })
      .use(InstagramUrl, {
        target: Dashboard,
      })
      .use(Url, {
        target: Dashboard,
        companionUrl: 'http://localhost:13020',
        title: 'Public Link',
      })
      .use(ImageEditor, {
        target: Dashboard,
        quality: 1.0,
      })

    uppy.on('upload-success', (file) => {
      uppy.removeFile(file.id)
    })
  },
}
</script>

<style lang="scss" scoped>
.uploader {
  @apply h-full;
}

::v-deep {
  .uppy-Root {
    @apply h-full;
  }

  .uppy-Dashboard-inner {
    @apply bg-transparent;
  }

  .uppy-Dashboard-browse {
    @apply text-primary;
  }

  .uppy-Dashboard-browse:focus, .uppy-Dashboard-browse:hover {
    @apply border-primary;
  }
}
</style>
