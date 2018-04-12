# Update Webpack Config

## Chain Webpack

```js
// poi.config.js
module.exports = {
  chainWebpack(config, context) {
    // Do something..
  }
}
```

- `config`: [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain) instance
- `context`
  - `type`: Default to`client`
  - `command`: Current running command, `build` `develop` `test` etc.

## Configure Webpack

```js
// poi.config.js
module.exports = {
  configureWebpack(config, context) {
    // Do something..
    // optionally return config
  }
}
```

- `config`: [webpack configuration object](https://webpack.js.org/configuration/#options)
- `context`
  - `type`: Default to`client`
  - `command:` Current running command, `build` `develop` `test` etc.
