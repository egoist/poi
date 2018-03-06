# plugin-sw-precache

Integrated [sw-precache-webpack-plugin](https://github.com/goldhand/sw-precache-webpack-plugin) into production configuration to add Progressive Web App support.

This is basically extracted from [create-react-app](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#making-a-progressive-web-app) but as a Poi plugin.

A live example can be found at: https://poi-sw-precache.surge.sh, you can enable `offline` mode in chrome devtools to check if it works for you.

## Install

```bash
yarn add @poi/plugin-sw-precache
```

## Usage

Add the plugin to your config file:

```js
module.exports = {
  plugins: [
    require('@poi/plugin-sw-precache')()
  ]
}
```

Then register service worker in your entry file:

```js
import register from '@poi/plugin-sw-precache/register-service-worker'

register()
```

To have a full progressive web app support, you need to put your PWA metadata file at `./static/manifest.json`, here's an example:

```json

{
  "short_name": "Poi App",
  "name": "My Sample App",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": "./index.html",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

And of course `favicon.ico` is also required in this example.

### Service worker events

You can use your own version of [./register-service-worker.js](./register-service-worker.js) to handle service worker events, like what to perform when new updates of your app are available, by default it simply logs a message and users to to refresh browser to see updated version.

## License

MIT &copy; [EGOIST](https://github.com/egoist)
