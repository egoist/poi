# vbuild [![NPM version](https://img.shields.io/npm/v/vbuild.svg)](https://npmjs.com/package/vbuild) [![NPM downloads](https://img.shields.io/npm/dm/vbuild.svg)](https://npmjs.com/package/vbuild) [![Build Status](https://img.shields.io/circleci/project/egoist/vbuild/master.svg)](https://circleci.com/gh/egoist/vbuild)

Preset build tool for Vue.js apps.

## What can be done perfectly?

- Web apps made with Vue.js
- Desktop apps made with Electron and Vue.js

## Install

```bash
$ npm install -g vbuild
```

## Usage

You can use full-featured ES2015+ and PostCSS with CSSNext in your Vue apps.

```bash
# build ./src/index.js
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

## Advanced configuration

Drop a `vbuild.js` in the root of your project directory:

```js
export default {
  // the options here (except `webpack()` function) can be override by cli arguments
  entry: {
    js: './src/app.js',
    css: './src/app.css'
  },
  webpack(config, options) {
    // config:  webpack config
    // options: cli arguments merged with options above
    
    // update config before building
    // this can override everything in cli arguments and options above
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
    vbuild [entries] [options]

  Example:
    vbuild --port 4000 --dev --browser-sync

  Options:
    -d/--dev:                   Development mode
    -p/--port [port]:           Server port, port is optional
    -t/--title [title]:         App title, title is optional
    --electron:                 Electron mode
    --silent:                   Do not open browser
    --browser-sync [port]:      Browser Sync, port is optional
    -c/--config:                Specific a config file path
    -v/--version:               Print version
    -h/--help:                  Print help (You are here!)
```

## License

MIT © [EGOIST](https://github.com/egoist)
