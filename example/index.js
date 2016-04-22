import Vue from 'vue'
import app from './app'

function init() {
  return new Vue({
    el: 'body',
    components: {app}
  })
}

init()
