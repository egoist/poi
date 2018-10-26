// eslint-disable-next-line import/no-unresolved
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default () =>
  new Router({
    mode: 'history'
  })
