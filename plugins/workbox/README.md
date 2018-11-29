# @poi/plugin-workbox

Making your website offline-ready with [Workbox](https://developers.google.com/web/tools/workbox/).

## Install

```bash
yarn add @poi/plugin-workbox --dev
```

## How to use

In your `poi.config.js`:

```js
module.exports = {
  plugins: [
    {
      resolve: '@poi/plugin-workbox'
    }
  ]
}
```

Then running Poi in production mode will generate a `/service-worker.js` file, you can register it in your app to make your website offline-ready.

You can manually register the service worker following [the official guide](https://developers.google.com/web/fundamentals/primers/service-workers/registration), but there's also a module on npm which can be used to simplify the process:

```bash
yarn add register-service-worker
```

```js
import { register } from 'register-service-worker'

register(__PUBLIC_URL__ + 'service-worker.js', {
  ready(registration) {
    console.log('Service worker is active.')
  },
  registered(registration) {
    console.log('Service worker has been registered.')
  },
  cached(registration) {
    console.log('Content has been cached for offline use.')
  },
  updatefound(registration) {
    console.log('New content is downloading.')
  },
  updated(registration) {
    console.log('New content is available; please refresh.')
  },
  offline() {
    console.log('No internet connection found. App is running in offline mode.')
  },
  error(error) {
    console.error('Error during service worker registration:', error)
  }
})
```
