# @poi/plugin-vue-static

You might be familar with building a SPA using Vue, Vue Router and Poi (webpack) already, here we're introducing a Poi plugin that pre-renders each page of your SPA using vue-server-renderer at build time.

## Install

Install this plugin in a Vue project:

```bash
yarn add @poi/plugin-vue-static --dev
```

You should also have `vue` and `vue-template-compiler` installed in your project.

Now you can load this plugin in `poi.config.js`:

```js
module.exports = {
  entry: './src/index.js',
  plugins: [
    {
      resolve: '@poi/plugin-vue-static'
    }
  ]
}
```

## How to use

### Entry file

With this plugin, you should export a function which returns an object in the entry file:

```js
// src/index.js
import Router from 'vue-router'

export default () => {
  const router = new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        component: () => import('./pages/index.vue')
      }
    ]
  })

  // Returned object will be used as the options
  // for root Vue instance
  return {
    router
  }
}
```

### Generate static website

By default it only render HTML for route `/` because we don't know what pages you want to statically render at build time. Here you can use `staticRoutes` to let us know:

```js
// poi.config.js
module.exports = {
  entry: './src/index.js',
  plugins: [
    {
      resolve: '@poi/plugin-vue-static',
      options: {
        staticRoutes: ['/user/egoist', '/user/cristiano']
      }
    }
  ]
}
```

Then you will get `index.html` `user/egoist/index.html` and `user/cristiano/index.html`.

## Options

### staticRoutes

- Type: `string[]`
- Default: `['/']`

### resourceHints

- Type: `boolean`
- Default: `true`

Add `prefetch` and `preload` resource hints to `<head>`.

### runInNewContext

- Type: `boolean`
- Default: `false`

With `runInNewContext: false`, the bundle code will run in the same `global` context with the server process, so be careful about code that modifies `global` in your application code.

See more details [here](https://ssr.vuejs.org/api/#runinnewcontext).

## FAQ

### How do I modify webpack config for specific build?

The `chainWebpack` option actually has a second argument:

```js
// poi.config.js
module.exports = {
  chainWebpack(config, { type }) {
    console.log(type)
  }
}
```

Without this plugin, `type` always equals to `'client'`. When using `vue-static` plugin it will be `'server'` for server build.

Notably:

- There's only client build when running `poi --serve` since it is still bundled as SPA.
- Without the `--serve` flag Poi will generate two builds, client build and server build.

### How do I write code applying to client build only?

Via the environment variable in your app code:

```js
if (process.server) {
  // this is the server build
}

if (process.client) {
  // alias: process.browser
  // this is the client build
  // you can safely access browser API here
  // like `window.document`
}
```

### How do I manipulate head tags?

Via `head` option in your Vue component:

```vue
<script>
export default {
  head: {
    title: 'Page Title'
  }
}
</script>
```

This feature is powered by [vue-meta](https://github.com/declandewet/vue-meta) under the hood, but here we are using `head` instead of the default `metaInfo` option.

## Showcase

A list of websites built with `vue-static`:

- [Vue Land](https://vue-land.js.org): website for Vue Land the official Vue.js Discord Community.
