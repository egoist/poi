import Vue from 'vue'
import App from './App.vue'

const assign = (...args) => {
  console.log('custom assign')
  return Object.assign(...args)
}

new Vue({
  el: '#app',
  ...App
})
