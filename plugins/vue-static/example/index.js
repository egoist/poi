import Router from 'vue-router'
import './style.css'

export default () => ({
  router: new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        component: () => import('./home.vue')
      }
    ]
  }),
  render(h) {
    return h('div', { attrs: { id: 'app' } }, [h('router-view')])
  }
})
