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
    require('poi-preset-elm')(options)
  ]
}
```

## Options

### loaderOptions

Type: `object`<br>
Default:

```js
{
  pathToMake: null, // Default to `node_modules/.bin/elm-make` if it exists, otherwise it uses global `elm-make`
  warn: true,
  debug: poi.options.mode !== 'production'
}
```

[options](https://github.com/elm-community/elm-webpack-loader#options) for elm-webpack-loader.

## License

MIT © [EGOIST](https://github.com/egoist)
