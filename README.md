# vbuild [![NPM version](https://img.shields.io/npm/v/vbuild.svg)](https://npmjs.com/package/vbuild) [![NPM downloads](https://img.shields.io/npm/dm/vbuild.svg)](https://npmjs.com/package/vbuild) [![Build Status](https://img.shields.io/circleci/project/egoist/vbuild/master.svg)](https://circleci.com/gh/egoist/vbuild) [![Coveralls branch](https://img.shields.io/coveralls/egoist/vbuild/master.svg)](https://github.com/egoist/vbuild)

Preset build tool for Vue.js apps.

## What can be done perfectly?

- [Web apps made with Vue.js](https://github.com/egoist/vbuild/wiki/Regular-web-applications-using-Vue.js)
- [Desktop apps made with Electron and Vue.js](https://github.com/egoist/vbuild/wiki/Electron-apps)
- Vue related stuffs, like Vue components, directives, etc.
- Customizable configuration file.

**Dive into the [API](#api) to see more.** 😋

## Install

**Install via NPM**, work with Node >= 4 and NPM >=3:

```bash
# it takes me 7 minutes to complete the installation
$ npm install -g vbuild
```

Note: only Vue 2 is supported.

## Usage

You can use full-featured ES2015+ and PostCSS in your Vue apps.

```bash
# build ./src/index.js
# production ready
$ vbuild
# yeppppp! so simple!

# build something elsewhere
$ vbuild ./lib/foo.js

# development? sure! with hot reloading!
# -d/--dev
$ vbuild --dev

# your app deserves a name, ie. <title> in html
# -t/--title
$ vbuild --title FaceBook
```

### Not a scaffolding tool

Scaffolding tools like Yeoman and Vue-cli save us a lot of time, while `vbuild` does not add additional files into your projects but those do. You can skip the step of generating boilerplates and start writing code of your app immediately.

### Fun for prototyping

Imagine using scaffolding tool for prototyping every small demos of you? Dear lord! I refuse to do that. You can use `vbuild` for your experiments or demos with nearly no setup.

### Production ready

`vbuild` can build production ready apps by default. 😅


### Universal apps

Really? sure, I will add this feature once Vue supports Virtual Dom or Server-side rendering. And it will come soon!

## Configuration file

Drop a `vue.config.json` in the root of your project directory:

```js
{
  "entry": "./src/entry.js",
  // ...
  // you can specific different config for production mode
  // and development mode
  "development": {
    "live": true
  }
}
```

## Help

For more usages:

```bash
$ vbuild --help
```

## API

```js
import vbuild from 'vbuild'

vbuild(options).then(/* your code */)
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

#### watch

Type: `boolean`<br>
Default: `false`

Run in watch mode, works like `webpack --watch`

#### port

Type: `number`<br>
Default: `4000`

Dev server port.

#### title

Type: `string`<br>
Default: `vbuild`

HTML title.

#### dist

Type: `string`<br>
Default: `dist`

Dist directory.

#### postcss

Type: `object`

PostCSS options:

```js
{
  "postcss": {
    // specific custom plugins:
    "use": ["postcss-mixins"],
    // set plugin options this way
    "postcss-mixins": {},
    // override built-in plugins
    "append": false
  }
}
```

By default `autoprefixer` and `postcss-nested` are build-in plugins.

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

#### live

Type: `boolean`<br>
Default: `false`

Live reloading when files change.

#### lint

Type: `boolean`<br>
Default: `false`

Build and Lint your code. (ESlint for now)

#### eslint

Type: `object`<br>
Default: `{}`

ESlint-compatiable config.

#### cssModules

Type: `boolean`

Enable CSS modules support.

#### disableHtml

Type: `boolean`<br>
Default: `false`

Prevent from generating html files, it's set to `true` in `--umd` and `--cjs` mode. But you can override it.

#### outputAssetsPath

Type: `boolean` `string`<br>
Default: `false` `vbuild-assets.json`

Use `assets-webpack-plugin` to output assets path in `./vbuild-assets.json`, if it's a `string` we use it as filename.

#### template

Type: `string`

Html-webpack-plugin template.

#### alias

Type: `boolean` `string`<br>
Default: `false`

Use default webpack `resolve.alias` preset. Use a string to specific custom `src` dir to your app. eg: `--alias example`, then `import 'src/app'` becomes `/absolute/path/to/example/app`.

#### devtool

Type: `string`<br>

Webpack devtool, by default it's `cheap-module-eval-source-map` in `dev` `watch` mode, and `source-map` in `production` mode.

#### development

Type: `object`<br>
Default: `undefined`

Development options, will be deeply assigned into `options` in `--dev` mode.

#### production

Type: `object`<br>
Default: `undefined`

Production options, will be deeply assigned into `options` in build mode.

#### config

Type: `string`<br>
Default: `./vue.config.json`

Specific a custom config file path. Set to `false` to disable config file.


## License

MIT © [EGOIST](https://github.com/egoist)
