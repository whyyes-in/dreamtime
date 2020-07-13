export default async function (to, from, savedPosition) {
  if (savedPosition) {
    return savedPosition
  }

  const findEl = async (hash, x = 0) => (
    document.querySelector(hash)
      // eslint-disable-next-line consistent-return
      || new Promise((resolve) => {
        if (x > 50) {
          return resolve(document.querySelector('#app'))
        }
        setTimeout(() => {
          resolve(findEl(hash, x += 1 || 1))
        }, 100)
      })
  )

  if (to.hash) {
    const container = document.getElementById('layout-content')
    const el = await findEl(to.hash)

    if ('scrollBehavior' in document.documentElement.style) {
      return container.scrollTo({ top: el.offsetTop, behavior: 'smooth' })
    }

    return container.scrollTo(0, el.offsetTop)
  }

  return { x: 0, y: 0 }
}
