# vbuild [![NPM version](https://img.shields.io/npm/v/vbuild.svg?style=flat-square)](https://npmjs.com/package/vbuild) [![NPM downloads](https://img.shields.io/npm/dm/vbuild.svg?style=flat-square)](https://npmjs.com/package/vbuild) [![Build Status](https://img.shields.io/circleci/project/egoist/vbuild/master.svg?style=flat-square)](https://circleci.com/gh/egoist/vbuild) 

Preset build tool for Vue.js apps.

## What can be done perfectly?

- Web apps made with Vue.js
- Desktop apps made with Electron and Vue.js
- Vue related stuffs, like Vue components, directives, etc.
- Customizable configuration file.

**Dive into the [website](http://vbuild.js.org/#/guide/home) to see more.** 😋

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

## Help

For more usages:

```bash
$ vbuild --help
```

## License

MIT © [EGOIST](https://github.com/egoist)
