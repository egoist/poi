# Options

You can put the options in a config file, and you can also override it from CLI flags: e.g. `poi build --out-dir example/dist` or set something to false: `poi build --no-minimize`.

CLI flags will be automatically camelCased.

## Shared options

These options are shared in all commands.

### entry

Type: `string` `string[]` `object`<br>
Default: `index.js`<br>
CLI override: `poi [entry]`

The entry file of your app.

### outDir

Type: `string`<br>
Default: `dist`<br>
CLI flags: `--out-dir` `-d`

The output directory of bundled files.

### publicPath

Type: `string`<br>
Default: `/`<br>
CLI flags: `--public-path`

This option specifies the public URL of the output directory when referenced in a browser.

### format

Type: `string`<br>
Default: `undefined`<br>
Possible values: `cjs` `umd`<br>
CLI flags: `--format`

Bundle format, not set by default meaning it will be bundled in iife format.

### babel

#### jsx

Type: `string`<br>
Default: `react`<br>
Possible values: `react` `vue` or any JSX pragma like `h` for Preact et al.<br>
CLI flags: `--babel.jsx`

Controlling how to transform JSX.

> __NOTE__: This only works if you __DON'T__ use a custom babel config file.

#### include

Type: `string[]`<br>
Default: `undefined`

Transpile certain modules with Babel.

### css

#### extract

Type: `boolean`<br>
Default: `true` in `poi build`, `false` otherwise.

Extract CSS into standalone files.

#### modules

Type: `boolean`<br>
Default: `false`

Enable CSS modules for all CSS files.

> __NOTE__: CSS modules are enabled by default for `.module.css` etc.

### moduleName

Type: `string`<br>
Default: `undefined`<br>
CLI flags: `--module-name`

When you're bundling in umd [format](#format), you need to set module name so that your library can be accessed via `window.YOUR_MODULE_NAME`.

### env

Type: `boolean`<br>
Default: `true`<br>
CLI flags: `--env`

Load `.env` file from current working directory, the defined env variables will be available in both Node.js process and your application code.

> __NOTE__: This is not available in config file since env variables should be defined before loading your config file.

### define

Type: `object`<br>
Default: `undefined`

Define global constants which can be configured at compile time.

Please refer to relevant [webpack docs](https://webpack.js.org/plugins/define-plugin/#usage) for more usage of this.

### sourceMap

Type: `boolean` `string`<br>
Default: `source-map` in `poi build`, `inline-source-map` in `poi test`, `eval-source-map` otherwise.<br>
Possible values: any [devtool](https://webpack.js.org/configuration/devtool/#devtool).<br>
CLI flags: `--source-map`

Disable or use custom sourcemap type.

### minimize

Type: `boolean`<br>
Default: `true` in `poi build`, `false` otherwise<br>
CLI flags: `--minimize`

Minimize bundled code.

### filename

#### js

Type: `string`<br>
Default: `[name].[chunkhash:8].js` in `poi build`, `[name].js` otherwise.<br>
CLI flags: `--filename.js`

Output filename for `.js` files.

#### css

Type: `string`<br>
Default: `[name].[chunkhash:8].css` in `poi build`, `[name].css` otherwise.<br>
CLI flags: `--filename.css`

Output filename for `.js` files.

#### chunk

Type: `string`<br>
Default: `[name].[chunkhash:8].js` in `poi build`, `[name].js` otherwise.<br>
CLI flags: `--filename.chunk`

Output filename for lazy-loaded chunk files.

#### font

Type: `string`<br>
Default: `assets/fonts/[name].[hash:8].[ext]` in `poi build`, `assets/fonts/[name].[ext]` otherwise.<br>
CLI flags: `--filename.font`

Output filename for font files.

#### image

Type: `string`<br>
Default: `assets/images/[name].[hash:8].[ext]`<br>
CLI flags: `--filename.image`

Output filename for image files.

### vue

#### fullBuild

Type: `boolean`<br>
Default: `false`

Use [Runtime + Compile](https://vuejs.org/v2/guide/installation.html#Runtime-Compiler-vs-Runtime-only) build of Vue.js,

#### loaderOptions

Type: `object` `loaderOptions => newLoaderOptions`

Merge this object with default options of `vue-loader` using `lodash.merge`.

### html

Options for [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin).

Default:

(`pkg` is the data of your `package.json`)

```js
{
  // Default to `pkg.title` or directory name
  title,
  // Default to `pkg.description`
  description,
  // The environment variables you defined
  env,
  // Entire `pkg`
  pkg
}
```

You can access these options in template file via `htmlWebpackPlugin.options`.

## Dev options

These options are only for `poi` and `poi develop`.

### host

Type: `string`<br>
Default: `process.env.HOST || '0.0.0.0'`

Host for development server.

### port

Type: `number` `string`<br>
Default: `process.env.PORT || 4000`

Port for development server.

### hotReload

Type: `boolean`<br>
Default: `true` in `poi` and `poi develop`, `false` otherwise

Toggle HMR.

### hotEntry

Type: `string` `string[]`<br>
Default: `main`

Add HMR client to specific entries.

### restartOnFileChanges

Type: `string` `string[]`

Restart the Poi process when specific files are modified.

> __NOTE__: We always watch Poi config file unless this option is set to `false`.

## Build options

These options are only for `poi build`.

### hash

Type: `boolean`<br>
Default: `true`

Toggle hash in [filename](#filename).
