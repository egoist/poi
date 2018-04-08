import Vue from 'vue'
import App from './App.vue'
import { assert } from 'chai'

it('ok', () => {
  const Ctor = Vue.extend(App)
  const vm = new Ctor().$mount()
  assert.equal(vm.$el.textContent, '0')
})
