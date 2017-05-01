import Vue from 'vue'
import App from './App.vue'

it('ok', () => {
  const Ctor = Vue.extend(App)
  const vm = new Ctor().$mount()
  expect(vm.$el.textContent).toBe('0')
})
