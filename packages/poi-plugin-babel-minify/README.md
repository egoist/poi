# poi-plugin-babel-minify

Use [babel-minify](https://github.com/babel/babel-minify) to minimize JavaScript.

## Install

```bash
yarn add poi-plugin-babel-minify --dev
```

## Usage

This plugin will replace UglifyjsPlugin with [babel-minify-webpack-plugin](https://github.com/webpack-contrib/babel-minify-webpack-plugin) for you:

```js
// poi.config.js
module.exports = {
  plugins: [
    require('poi-plugin-babel-minify')()
  ]
}
```

Then it will compress JS code when you run `poi build`.

It accepts the same options as which in [babel-minify-webpack-plugin](https://github.com/webpack-contrib/babel-minify-webpack-plugin#options):

```js
require('poi-plugin-babel-minify')(babelMinifyOptions, overrides)
```

## License

MIT &copy; [EGOIST](https://github.com/egoist)
