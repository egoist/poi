# vbuild [![NPM version](https://img.shields.io/npm/v/vbuild.svg)](https://npmjs.com/package/vbuild) [![NPM downloads](https://img.shields.io/npm/dm/vbuild.svg)](https://npmjs.com/package/vbuild) [![Build Status](https://img.shields.io/circleci/project/egoist/vbuild/master.svg)](https://circleci.com/gh/egoist/vbuild) [![Coveralls branch](https://img.shields.io/coveralls/egoist/vbuild/master.svg)](https://github.com/egoist/vbuild)

Preset build tool for Vue.js apps.

![preview](https://ooo.0o0.ooo/2016/04/22/5719ce0ab62b9.gif)

## What can be done perfectly?

- Web apps made with Vue.js
- Desktop apps made with Electron and Vue.js
- Vue related stuffs, like Vue components, directives, etc.

## Install

Recommend Node >= 4 and NPM >=3:

```bash
# it takes me 7 minutes to complete the installation
$ npm install -g vbuild
```

## Usage

You can use full-featured ES2015+ and PostCSS with CSSNext in your Vue apps.

```bash
# build ./src/index.js
$ vbuild
# yeppppp! so simple!

# build something elsewhere
# -e/--entry
$ vbuild --entry ./lib/foo.js

# development? sure! with hot reloading!
# -d/--dev
$ vbuild --dev

# your app deserves a name, ie. <title> in html
# -t/--title
$ vbuild --title FaceBook
```

## Advanced configuration

Drop a `vbuild.js` in the root of your project directory:

```js
export default {
  // the options here (except `webpack()` function) can be override by cli arguments
  entry: {
    js: './src/app.js',
    css: './src/app.css'
  },
  browsers: ['ie > 10', 'last 1 version'],
  webpack(config, options) {
    // config:  webpack config
    // options: cli arguments merged with options above
    
    // update config before building
    // this can override changes made by cli arguments and options above
    config.entry = './goaway.js'
  }
}
```

## Help

For more usages:

```bash
$ vbuild --help

  Preset build tool for Vue.js apps.

  Usage:
    vbuild [options]

  Example:
    vbuild --entry index.js --port 4000 --dev --browser-sync

  Options:
    -e/--entry:                 Specific entries
    -d/--dev:                   Development mode
    -p/--port [port]:           Server port, port is optional
    -t/--title [title]:         App title, title is optional
    -b/--browsers:              Set autoprefixer browser list
    --lint:                     Lint your code
    --umd <moduleName>:         UMD mode and prvide a module name
    --cjs:                      CommonJS mode
    --electron:                 Electron mode
    --silent:                   Do not open browser
    --browser-sync [port]:      Browser Sync, port is optional
    -c/--config [path]:         Use config file or specific a config file path
    -v/--version:               Print version
    -h/--help:                  Print help (You are here!)
```

## API

```js
import vbuild from 'vbuild'

(async function () {
  await vbuild(options)
})()
```

### options

#### entry

Type: `string` `array` `object`<br>
Default: `./src/index.js`

Webpack config entry.

#### dev

Type: `boolean`<br>
Default: `false`

Run in development mode, ie. hot reloading and a lot more.

#### port

Type: `number`<br>
Default: `4000`

Dev server port.

#### title

Type: `string`<br>
Default: `vbuild`

HTML title.

#### browsers

Type: `array`<br>
Default: `['> 5%', 'last 2 version', 'ie > 8']`

Autoprefixer browser list.

#### umd

Type: `string`

Build in UMD format, and specific a moduleName.

#### cjs

Type: `boolean`<br>
Default: `false`

Build in CommonJS format.

#### electron

Type: `boolean`<br>
Default: `false`

Use Electron mode to build, support hot reloading.

#### silent

Type: `boolean`<br>
Default: `false`

Don't open browser when bundle valid in dev mode.

#### browserSync

Type: `boolean` `number`<br>
Default: `false` `23789`

Use browser-sync-webpack-plugin and specific a port to run at.

#### lint

Type: `boolean`<br>
Default: `false`

Lint your code. (ESlint for now)

#### eslint

Type: `object`<br>
Default: `{}`

ESlint-compatiable config.

#### webpack

Type: `function`<br>
Default: `undefined`<br>
Params: `config` `options`

Specfic a function to update webpack `config` before building. `options` is the API options.

#### config

Type: `string` `boolean`<br>
Default: `./vbuild.js` `false`

Use default config file or specific a config file.

## License

MIT © [EGOIST](https://github.com/egoist)
