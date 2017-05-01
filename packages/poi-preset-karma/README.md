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

## Options

### port

Type: `number`<br>
Default: `5001`

### testFiles

Type: `Array` `string`<br>
Default: `['test/unit/**/*.test.js']`

### testFrameworks

Type: `Array`<br>
Default: `['jasmine']`

### browsers

Type: `Array`<br>
Default: `['PhantomJS']`
