import createApp from '#user-entry'

export default context => {
  const app = typeof createApp === 'function' ? createApp(context) : createApp

  if (app.$meta) {
    context.meta = app.$meta()
  }
  return app
}