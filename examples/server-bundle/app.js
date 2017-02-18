import Vue from 'vue'
import 'examples/server-bundle/foo'
import './style'
const app = new Vue({
  render: h => <h1>Hello World!</h1>
})

export {app}
