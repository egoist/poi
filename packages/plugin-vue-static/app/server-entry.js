import createApp from './create-app'

export default async context => {
  const { app, router } = createApp()

  // Add app-shell.html for server build only
  // So that we can generate the app-shell.html with empty content
  router.addRoutes([
    {
      path: '/app-shell.html',
      component: {
        render() {}
      }
    }
  ])

  router.push(context.url)

  return new Promise((resolve, reject) => {
    router.onReady(() => {
      context.meta = app.$meta()
      resolve(app)
    }, reject)
  })
}
