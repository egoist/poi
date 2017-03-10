# Options

Options are available in both CLI arguments and config file.

## General

### entry

Type: `string` `Array` `object`<br>
Default: value of pkg.main of `index.js`

The path to entry file.

### dist

Type: `string`<br>
Default: `dist`

Target folder for bundled files

### babel

Type: `Object`

It searches for `.babelrc` or `babel` field in `package.json`, if none of them exists, it uses default babel config:

```js
{
  babelrc: false,
  cacheDirectory: true,
  presets: ['vue-app']
}
```

You can use this option to override it if you don't want extra config file for babel.

### postcss

Type: `Array` `object` `function`

It searches for custom postcss config file using [postcss-load-config](https://github.com/michael-ciniawsky/postcss-load-config), and add `autoprefixer` to the top of it when `postcss` is an array or object.

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
  title: pkg.title || pkg.productionName || pkg.name,
  description: pkg.description,
  template: // defaults to $cwd/index.html if it exists, otherwise use built-in template
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
  static: 'static/[name].[ext]'  
}
```

### copy

Type: `Array`

Default value:

```js
// copy static/*\*/* to dist folder
[{ from: 'static', to: './' }]
```

Options for [copy-webpack-plugin](https://github.com/kevlened/copy-webpack-plugin).

### define

Type: `object`

Options for [webpack.DefinePlugin](https://webpack.js.org/plugins/define-plugin/)

### env

Type: `object`

Short hand for using `webpack.DefinePlugin` to define contants under `process.env`. By default `process.env.NODE_ENV` is defined for you.

## Production

### cleanDist

Type: `boolean`<br>
Default: `true`

Remove all files in dist folder (but keeps that folder itself).

### json

Type: `boolean` `string`

Output webpack stats to `stats.json` or a custom path.

## Development

### port

Type: `number`<br>
Default: `4000`

### host

Type: `string`<br>
Default: `localhost`

### proxy

Type: `string` `object`

### hot

Type: `boolean`<br>
Default: `true`

Enable hot reloading (with live reloading fallback)

### hmrEntry

Type: `Array`<br>
Default: `['client']`

Add `webpack-hot-middleware` client to given entries.

### hmrLog

Type: `boolean`<br>
Default: `true`

Output informational log for `webpack-hot-middleware`.
