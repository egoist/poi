import Vue from 'vue'
import Counter from './Counter.vue'

test('correct content', () => {
  const Ctor = Vue.extend(Counter)
  const vm = new Ctor().$mount()
  expect(vm.$el.textContent).toBe('1')
})
