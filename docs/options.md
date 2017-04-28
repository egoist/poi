# Options

Options are available in both CLI arguments and config file.

## General

### entry

Type: `string` `Array` `object`<br>
Default: value of pkg.main or `index.js`

The path to entry file.

### dist

Type: `string`<br>
Default: `dist`

Target folder for bundled files

### babel

Type: `Object`

If you're using CLI, it searches for `.babelrc` or `babel` field in `package.json`, if none of them exists, it uses default babel config:

```js
{
  babelrc: false,
  cacheDirectory: true,
  presets: ['vue-app']
}
```

You can use this option to override it if you don't want extra config file for babel.

### postcss

Type: `Array` `object`

If you're using CLI, it searches for custom postcss config file using [postcss-load-config](https://github.com/michael-ciniawsky/postcss-load-config), and add `autoprefixer` to the top of it when `postcss` is an array or object.

You can use this option to override it if you don't want extra config file for postcss.

### autoprefixer

Type: `object` `boolean`

Default:

```js
{
  browsers: ['ie > 8', 'last 4 versions']
}
```

Options for [autoprefixer](https://github.com/postcss/autoprefixer), set to `false` to disable it.

### cssModules

Type: `boolean`<br>
Default: `false`

Process CSS using [css modules](https://github.com/css-modules/css-modules).

### html

Type: `Object` `Array` `boolean`

Default value:

```js
{
  // `pkg` indicates the data in `package.json`
  title: pkg.title || pkg.productName || pkg.name,
  description: pkg.description,
  env: {}, // env option
  template: // defaults to $cwd/index.html if it exists, otherwise use built-in template,
}
```

Options for [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin) or an array of it. Set it to `false` to disable this plugin.

### filename

Type: `object`

filename of output files, eg:

```js
filename: {
  js: 'index.js',
  css: 'style.css',
  static: 'static/[name].[ext]',
  chunk: '[id].chunk.js'
}
```

### copy

Type: `boolean`<br>
Default: `true`

Options for [copy-webpack-plugin](https://github.com/kevlened/copy-webpack-plugin), by default it will copy `static/*` to `dist/*`

### define

Type: `object`

Use `webpack.DefinePlugin` to replace string in source files, each value is stringified by default, eg:

```js
module.exports = {
  define: {
    __VERSION__: '1.0.0'
  }
}
```

### env

Type: `object`

Short hand for the `define` option to define contants under `process.env`. By default `process.env.NODE_ENV` is defined for you, eg:

```js
module.exports = {
  env: {
    SECRET: '******'
  }
}
```

### webpack

Type: `function`

Mutate raw webpack config and you must return the updated config:

```js
module.exports = {
  webpack(config) {
    config.plugins = config.plugins.filter(removeSomePlugin) // ...
    return config
  }
}
```

### extendWebpack

Type: `function`

Using [webpack-chain](https://github.com/mozilla-rpweb/webpack-chain) to modify webpack config in a predictable way:

```js
module.exports = {
  extendWebpack(config) {
    // Remove progress bar when building in production
    config.plugins.delete('progress-bar')
  }
}
```

More details about internal namings are coming soon.

## Production

### generateStats

Type: `boolean` `string`

Output webpack stats to `stats.json` or a custom path.

### vendor

Type: `boolean`<br>
Default: `true`

Automatically split vendor code (all imported modules in `node_modules`) into `vendor` chunk.

### sourceMap

Type: `boolean`<br>
Default: `true`

Generate sourcemaps.

### minimize

Type: `boolean`<br>
Default: `true`

Minimize JS and CSS files.

### extractCSS

Type: `boolean`<br>
Default: `true`

Extract CSS into a single file.

### homepage

Type: `string`<br>
Default: `/`

The path to load resource from, it's useful when your site is located at a subpatch like `http://example.com/blog`, you need to set `homepage` to `/blog/` in this situation.

## Development

### port

Type: `number`<br>
Default: `4000`

### host

Type: `string`<br>
Default: `localhost`

### setupDevServer

Type: `function`

See [custom server login](/#custom-server-logic) for usages.

### proxy

Type: `string` `object`

See [proxy api request](/#proxy-api-request) for usages.

### hotReload

Type: `boolean`<br>
Default: `true`

Enable Hot Mode Reloading.
