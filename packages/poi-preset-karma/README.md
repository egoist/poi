# poi-preset-karma

Use Karma to run unit tests for your Poi project.

## Install

```bash
yarn add poi poi-preset-karma --dev
```

Notes: You have to install `poi` locally in your project.

## Usage

```js
// poi.config.js
module.exports = {
  presets: [
    require('poi-preset-karma')({
      port: 5001, // default
      files: ['test/unit/*.test.js'] // default
    })
  ]
}
```

Then run `poi test`, this preset will only be activated in test mode.

Or run `poi test --watch` to run Karma in watch mode.

Or run `poi test --coverage` to get code coverage as well.

## Options

### port

Type: `number`<br>
Default: `5001`

### files

Type: `Array` `string`<br>
Default: `['test/unit/**/*.test.js']`

### frameworks

Type: `Array` `string`<br>
Default: `['mocha']`

### reporters

Type: `Array` `string`<br>
Default: `['mocha']`

If you enable code coverage the `coverage` reporter will automatically be added as well.

### browsers

Type: `Array` `string`<br>
Default: `['Chrome']`

You can use `headless` option to switch it to `ChromeHeadless` which is only available when you have Chrome>=59 installed.

You can also directly set `browsers` option to override it.

### headless

Type: `boolean`<br>
Default: `false`

Switch `browsers` to `ChromeHeadless`.

### watch

Type: `boolean`<br>
Default: `false`

Run karma in watch mode.

### coverage

Type: `boolean`<br>
Default: `false`

Generate code coverage.

### extendWebpack

Type: `function`<br>
Default: `undefined`

Extend webpack config using webpack-chain:

```js
require('poi-preset-karma')({
  extendWebpack(config) {
    config.some.action()
  }
})
```

## Advanced

This preset can also directly read Karma config from `karma` property in `poi.config.js`, and it will be merged with default karma config we use:

```js
// poi.config.js
module.exports = {
  karma: {
    frameworks: ['mocha', 'chai']
  }
}
```

We use `Object.assign` to merge custom karma config with our default one.

`karma` could also be a function, then we will use its return value as karma config:

```js
// poi.config.js
module.exports = {
  karma(config) {
    config.reporters = ['nyancat']
    return config
  }
}
```

### TypeScript support

It works with [poi-preset-typescript](https://github.com/egoist/poi/tree/master/packages/poi-preset-typescript).

```js
// poi.config.js
module.exports = {
  presets: [
    // The order matters!
    require('poi-preset-typescript')(),
    require('poi-preset-karma')()
  ]
}
```

## License

MIT &copy; [EGOIST](https://github.com/egoist)
