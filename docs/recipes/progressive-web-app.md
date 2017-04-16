# Progressive web app

To add [PWA](https://developers.google.com/web/progressive-web-apps/) support, at least you need to:

- Add [`manifest.json`](https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/) to `./static` folder, and the files inside will be copied to dist folder.
- Add [offline-plugin](https://github.com/NekR/offline-plugin)

## Example `manifest.json`

App manifest could enable the `Add to Home screen` feature to your app.

```json
{
  "name": "My Vue App",
  "short_name": "My Vue App",
  "start_url": "./",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#fff",
  "theme_color": "pink",
  "icons": [{
    "src": "./assets/icons/android-chrome-192x192.png",
    "type": "image/png",
    "sizes": "192x192"
  },
  {
    "src": "./assets/icons/android-chrome-512x512.png",
    "type": "image/png",
    "sizes": "512x512"
  }]
}
```

## Offline-Plugin

### Add plugin in config file

```js
const OfflinePlugin = require('offline-plugin')

module.exports = options => ({
  extendWebpack(config) {
    // we only need pwa support in production mode
    if (options.mode === 'production') {
      config.plugin('offline')
        .use(OfflinePlugin)
    }
  }
})
```

### Inject runtime into app

Populate a `pwa.js`:

```js
import runtime from 'offline-plugin/runtime'

runtime.install({
  // When an update is ready, tell ServiceWorker to take control immediately:
  onUpdateReady() {
    console.log('update ready')
    runtime.applyUpdate()
  },

  // Reload to get the new version:
  onUpdated() {
    console.log('updated')
    location.reload()
  }
})
```

Import it in your app, like in entry file:

```js
// register ServiceWorker via OfflinePlugin, for prod only:
if (process.env.NODE_ENV === 'production') {
  require('./pwa')
}
```

---

To keep improving the pwa performance, you can use some tool like [lighthouse](https://developers.google.com/web/tools/lighthouse/) to update your app step by step.
