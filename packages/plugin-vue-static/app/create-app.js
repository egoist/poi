/* eslint-disable import/no-unresolved */
import Vue from 'vue'
import Meta from 'vue-meta'
import createEntry from '#vue-static-cache/entry'
import routes from '#vue-static-cache/routes'
import createDefaultRouter from './default-router'

Vue.use(Meta, {
  keyName: 'head',
  attribute: 'data-poi-head',
  ssrAttribute: 'data-poi-ssr',
  tagIDKeyName: 'poid' //
})

export default () => {
  const entry = typeof createEntry === 'function' ? createEntry() : {}
  const router = entry.router || createDefaultRouter()

  router.addRoutes(routes)

  const app = new Vue({
    router,
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
    // Allow entry to override `render` function
    // If you know what you're doing
    ...entry
  })

  return {
    app,
    router
  }
}
