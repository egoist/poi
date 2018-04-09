# plugin-bundle-report

This is a plugin for adding [webpack-bundle-analyzer](https://github.com/th0r/webpack-bundle-analyzer) which could help you:

1.  Realize what's really inside your bundle
2.  Find out what modules make up the most of it's size
3.  Find modules that got there by mistake
4.  Optimize it!

## Install

```bash
yarn add @poi/plugin-bundle-report --dev
```

## Usage

Activate it in config file:

```js
// poi.config.js
module.exports = {
  plugins: [
    require('@poi/plugin-bundle-report')()
  ]
}
```

Add `--bundle-report` while building your app in **production mode** to get report:

```bash
poi build --bundle-report
# then you'll be automatically navigated to http://localhost:8888
```

## API

### options

#### options.pluginOptions

Options for [webpack-bundle-analyzer](https://github.com/th0r/webpack-bundle-analyzer) plugin.

## LICENSE

[MIT](https://oss.ninja/mit/egoist) &copy; [EGOIST](https://github.com/egoist)
