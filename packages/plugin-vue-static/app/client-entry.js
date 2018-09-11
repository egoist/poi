import Vue from 'vue'
import createApp from '#user-entry'

async function main() {
  let app
  if (typeof getEntry === 'function') {
    app = await createApp()
  } else {
    app = create
  }

  new Vue(app).$mount('#app')
}

main()