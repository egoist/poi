# @poi/plugin-pwa

Build a progressive web app with Poi and [Workbox](https://developers.google.com/web/tools/workbox/).

## Install

```bash
yarn add @poi/plugin-pwa --dev
```

## How to use

In your `poi.config.js`:

```js
module.exports = {
  plugins: [
    {
      resolve: '@poi/plugin-pwa',
      options: {}
    }
  ]
}
```

Then run Poi in production mode will generate a `/service-worker.js` file, you can register it in your app to make your website offline-ready.

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

## Options

Default value:

```js
{
  name: 'PWA app',
  themeColor: '#74d7fd', // The Poi color
  msTileColor: '#000000',
  appleMobileWebAppCapable: 'no',
  appleMobileWebAppStatusBarStyle: 'default',
  assetsVersion: '',
  iconPaths: {
    favicon16: 'img/icons/favicon-16x16.png',
    favicon32: 'img/icons/favicon-32x32.png',
    appleTouchIcon: 'img/icons/apple-touch-icon-152x152.png',
    safariMaskIcon: 'img/icons/safari-mask-icon.svg',
    msTileImage: 'img/icons/msapplication-icon-144x144.png'
  }
}
```

We use these options to generate `manifest.json` and update PWA-related tags in generated `index.html` file.

If you don't want to support some platform icons, simply pass `false` as the icon path, for example:

```js
{
  iconsPaths: {
    msTileImage: false
  }
}
```

Then we won't add HTML tag for this icon in `index.html`.

To customize the `manifest.json`, you can simply populate a `public/manifest.json` and we will merge it with our default one.
