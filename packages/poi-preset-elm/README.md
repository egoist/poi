# poi-preset-elm

Use Poi to build your Elm apps.

## Install

```bash
yarn add poi-preset-elm --dev
```

## Usage

```js
// poi.config.js
module.exports = {
  presets: [
    require('poi-preset-elm')({
      warn: true, // default
      debug: true, // default
    })
  ]
}
```

## License

MIT © [EGOIST](https://github.com/egoist)
