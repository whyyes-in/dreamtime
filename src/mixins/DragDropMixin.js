export const DragDropMixin = {
  data: () => ({
    isDragEnabled: true,
    isDragging: false,
    dragCounter: 0,
  }),

  mounted() {
    this.$router.afterEach(() => {
      this.dragCounter = 0
    })
  },

  methods: {
    /**
     *
     */
    onDragEnter(event) {
      if (!this.isDragEnabled) {
        return
      }

      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'

      this.dragCounter += 1
      this.isDragging = true
    },

    /**
     *
     */
    onDragLeave() {
      if (!this.isDragEnabled) {
        return
      }

      this.dragCounter -= 1

      if (this.dragCounter === 0) {
        this.isDragging = false
      }
    },

    /**
     *
     */
    onDragOver(event) {
      if (!this.isDragEnabled) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      event.dataTransfer.dropEffect = 'copy'
      this.isDragging = true
    },

    /**
     *
     */
    onDrop(event) {
      if (!this.isDragEnabled) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      this.isDragging = false

      const { files } = event.dataTransfer
      const url = event.dataTransfer.getData('url')

      if (url.length > 0) {
        this.onURL(url)
      } else if (files.length > 0) {
        this.onFiles(files)
      }
    },

    // eslint-disable-next-line no-unused-vars
    onURL(url) {

    },

    // eslint-disable-next-line no-unused-vars
    onFiles(files) {

    },
  },
}
