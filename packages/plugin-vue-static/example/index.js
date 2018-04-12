import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

let data = ''
import('./foo.css')
const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: () => import('./Home.vue')
    }
  ]
})

const app = new Vue({
  router,
  render: h => h('div', { attrs: { id: 'app' } }, [h('router-view')])
})

export default app
