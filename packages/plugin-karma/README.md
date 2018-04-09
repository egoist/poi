# plugin-karma

Use Karma to run unit tests for your Poi project.

## Install

```bash
yarn add poi @poi/plugin-karma --dev
```

Notes: You have to install `poi` locally in your project.

## Usage

```js
// poi.config.js
module.exports = {
  plugins: [
    require('@poi/plugin-karma')({
      port: 5001, // default
      files: ['test/unit/*.test.js'] // default
    })
  ]
}
```

Then run `poi test`, this plugin will only be activated in test mode.

Or run `poi test --watch` to run Karma in watch mode.

Or run `poi test --coverage` to get code coverage as well.

### Use with Assertion Library

By default this plugin does not add any assertion library, to use one like [chai.js](http://www.chaijs.com/) you can simply install it and use it in your test files, here's an [example](./example/App.test.js).

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

### karma

Type: `object` `karmaConfig => newkarmaConfig`

### chainWebpack

Type: `function`<br>
Default: `undefined`

Extending webpack config using webpack-chain:

```js
require('poi-plugin-karma')({
  chainWebpack(config) {
    config.some.action()
  }
})
```

### TypeScript support

It works with [poi-plugin-typescript](https://github.com/egoist/poi/tree/master/packages/poi-plugin-typescript).

You need to install `karma-typescript` and `typescript` locally in your project first, and configure `poi-plugin-typescript`:

```js
// poi.config.js
module.exports = {
  plugins: [
    // The order matters!
    require('poi-plugin-typescript')(),
    require('poi-plugin-karma')()
  ]
}
```

## License

[MIT](https://oss.ninja/mit/egoist) &copy; [EGOIST](https://github.com/egoist)
