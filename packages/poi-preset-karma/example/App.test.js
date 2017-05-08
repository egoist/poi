import Vue from 'vue'
import App from './App.vue'
import assert from 'assert'

it('ok', () => {
  const Ctor = Vue.extend(App)
  const vm = new Ctor().$mount()
  assert(vm.$el.textContent === '0')
})
