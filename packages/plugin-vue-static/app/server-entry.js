import createApp from './create-app'

export default async context => {
  const { app, router } = createApp()

  router.push(context.url)

  return new Promise((resolve, reject) => {
    router.onReady(() => {
      context.meta = app.$meta()
      resolve(app)
    }, reject)
  })
}
