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
      testFiles: ['test/unit/*.test.js'] // default
    })
  ]
}
```

Then run `poi test`, this preset will only be activated in test mode.

Or run `poi test --watch` to run Karma in watch mode.

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

## Advanced

This preset can also directly read Karma config from `karma` property in `poi.config.js`, and it will be merged with default karma config we use:

```js
// poi.config.js
module.exports = {
  karma: {
    frameworks: ['chai']
  }
}
```

Then the `frameworks` we finally got would be `['mocha', 'chai']`.
