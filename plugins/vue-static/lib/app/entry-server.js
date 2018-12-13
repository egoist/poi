import createApp from './create-app'

export default context =>
  new Promise((resolve, reject) => {
    const { app, router } = createApp()

    router.push(context.url)

    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      // no matched routes, reject with 404
      if (matchedComponents.length === 0) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return reject({ code: 404 })
      }

      context.meta = app.$meta()

      resolve(app)
    }, reject)
  })
