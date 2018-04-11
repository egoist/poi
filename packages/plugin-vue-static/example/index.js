import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

let data = ''

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: {
        prepare() {
          data = 'data'
        },
        render(h) {
          return h('h1', ['hello world', data])
        }
      }
    }
  ]
})

const app = new Vue({
  router,
  render: h => h('div', { attrs: { id: 'app' } }, [h('router-view')])
})

export default app
