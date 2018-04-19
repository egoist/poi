import './main'
import Vue from 'vue'
import app from '@project-entry'
import { routerReady, prepareComponents } from './utils'

// A global mixin that calls `prepare` when a route component's params change
Vue.mixin({
  beforeRouteUpdate(to, from, next) {
    const { prepare } = this.$options
    if (prepare) {
      prepare({
        store: this.$store,
        route: to
      })
        .then(next)
        .catch(next)
    } else {
      next()
    }
  }
})

// Wait until router has resolved all async before hooks
// and async components...
async function main() {
  // Prime the store with server-initialized state.
  // the state is determined during SSR and inlined in the page markup.
  if (window.__INITIAL_STATE__ && app.$store) {
    app.$store.replaceState(window.__INITIAL_STATE__)
  }

  await routerReady(app.$router)

  // Add router hook for handling prepare.
  // Doing it after initial route is resolved so that we don't double-fetch
  // the data that we already have. Using router.beforeResolve() so that all
  // async components are resolved.
  app.$router.beforeResolve((to, from, next) => {
    const matched = app.$router.getMatchedComponents(to)
    const prevMatched = app.$router.getMatchedComponents(from)
    let diffed = false
    const activated = matched.filter((c, i) => {
      if (diffed) return diffed
      diffed = prevMatched[i] !== c
      return diffed
    })
    const prepareHooks = activated.map(c => c.prepare).filter(_ => _)
    if (prepareHooks.length > 0) {
      return next()
    }

    Promise.all(
      prepareHooks.map(hook => hook({ store: app.$store, route: to }))
    )
      .then(() => {
        next()
      })
      .catch(next)
  })

  // Since in dev mode it's not SSR
  // So we run `prepare` on client-side
  if (process.env.NODE_ENV === 'development') {
    await prepareComponents(app.$router.getMatchedComponents(), {
      url: app.$router.currentRoute.path,
      route: app.$router.route,
      store: app.$store
    })
  }

  // Actually mount to DOM
  app.$mount('#app')
}

main().catch(console.error)
