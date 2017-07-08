# poi-preset-babili

Use [babili](https://github.com/babel/babili) to minimize JavaScript.

## Install

```bash
yarn add poi-preset-babili --dev
```

## Usage

This preset will replace UglifyjsPlugin with [babili-webpack-plugin](https://github.com/webpack-contrib/babili-webpack-plugin) for you:

```js
// poi.config.js
module.exports = {
  presets: [
    require('poi-preset-babili')()
  ]
}
```

Then it will compress JS code when you run `poi build`.

It accepts the same options as which in [babili-webpack-plugin](https://github.com/webpack-contrib/babili-webpack-plugin#options):

```js
require('poi-preset-babili')(babiliOptions, overrides)
```

## License

MIT &copy; [EGOIST](https://github.com/egoist)
