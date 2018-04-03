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
CLI flags: `--babel.jsx` `--jsx`

Controlling how to transform JSX.

> __NOTE__: This only works if you __DON'T__ use a custom babel config file.

#### include

Type: `string[]`<br>
Default: `undefined`

Transpile certain modules with Babel.

### moduleName

Type: `string`<br>
Default: `undefined`<br>
CLI flags: `--module-name`

When you're bundling in umd [format](#format), you need to set module name so that your library can be accessed via `window.YOUR_MODULE_NAME`.

### dotEnv

Type: `boolean`<br>
Default: `true`<br>
CLI flags: `--dot-env`

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
Default: `[name].[chunkhash:8].chunk.js` in `poi build`, `[name].chunk.js` otherwise.<br>
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


## Dev options

These options are only for `poi` and `poi dev`.

### host

Type: `string`<br>
Default: `process.env.HOST || '0.0.0.0'`

Host for development server.

### port

Type: `number` `string`<br>
Default: `process.env.PORT || 4000`

Port for development server.

## Build options

These options are only for `poi build`.

### hash

Type: `boolean`<br>
Default: `true`

Toggle hash in [filename](#filename).
