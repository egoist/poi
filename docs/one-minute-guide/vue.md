# Vue in 1 minute

Create a new project:

```bash
mkdir my-vue-app
cd my-vue-app
yarn init -y
yarn add poi --dev
```

Create an `index.js` in the project:

```js
import Vue from 'vue'
import App from './App.vue'

new Vue({
  el: '#app',
  render: h => h(App)
})
```

And the `App.vue` component:

```vue
<template>
  <div class="root">Hello World</div>
</template>

<style scoped>
.root {
  color: red;
}
</style>
```

Finally run your application with a single command:

```bash
# inside the project directory, run:
poi
```

🎉 Your app is now up and running at `http://localhost:4000`

