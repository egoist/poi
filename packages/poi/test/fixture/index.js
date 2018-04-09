import Vue from 'vue'

new Vue({
  el: '#app',
  render(h) {
    return h('h1', {
      attrs: {
        id: 'app'
      }
    }, ['hi'])
  }
})
