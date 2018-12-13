import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
// eslint-disable-next-line import/no-unresolved
import createRootOptions from '#user-entry'

if (
  process.env.NODE_ENV === 'development' &&
  typeof createRootOptions !== 'function'
) {
  throw new Error(
    `You must export a function in your entry file, but we got ${typeof createRootOptions}`
  )
}

// Add this so that you don't have to call Vue.use(Router) in your app
Vue.use(Router)

Vue.use(Meta, {
  keyName: 'head', // the component option name that vue-meta looks for meta info on.
  attribute: 'data-poi-head', // the attribute name vue-meta adds to the tags it observes
  ssrAttribute: 'data-poi-ssr', // the attribute name that lets vue-meta know that meta info has already been server-rendered
  tagIDKeyName: 'vmid' // the property name that vue-meta uses to determine whether to overwrite or append a tag
})

export default () => {
  const rootOptions = createRootOptions()

  if (process.env.NODE_ENV === 'development' && !rootOptions.router) {
    console.error(`You must provide a vue-router instance`)
  }

  if (
    process.env.NODE_ENV === 'development' &&
    rootOptions.router.options.mode !== 'history'
  ) {
    console.error(`You must use option \`mode\` to 'history' in vue-router`)
  }

  if (rootOptions.store) {
    require('vuex-router-sync').sync(rootOptions.store, rootOptions.router)
  }

  const app = new Vue({
    render(h) {
      return h(
        'div',
        {
          attrs: {
            id: 'app'
          }
        },
        [h('router-view')]
      )
    },
    ...rootOptions
  })

  return {
    app,
    router: rootOptions.router,
    store: rootOptions.store // Optional
  }
}
