# Poi

[![NPM version](https://img.shields.io/npm/v/poi.svg?style=for-the-badge)](https://npmjs.com/package/poi) [![NPM downloads](https://img.shields.io/npm/dm/poi.svg?style=for-the-badge)](https://npmjs.com/package/poi) [![Build Status](https://img.shields.io/circleci/project/egoist/poi/master.svg?style=for-the-badge)](https://circleci.com/gh/egoist/poi) [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=for-the-badge)](https://github.com/egoist/donate) [![chat](https://img.shields.io/badge/chat-on%20discord-7289DA.svg?style=for-the-badge)](https://chat.egoist.moe)

## Introduction

Poi is a __zero-config__ bundler built on the top of webpack. By using the buzz word `zero-config`, it does not mean that there's no config, instead we pre-configurared many things for you. To prevent Poi from becoming too bloated to use, we also introduced some kind of `plugin` system to make extra features opt-in.

To get a quick taste of Poi, you can install it globally via npm or yarn:

```bash
$ npm i -g poi
# But it's recommended to install it locally for real-world projects.
# i.e. cd your-project && npm i poi -D
```

The `poi` command is somehow similar to `node`, by running `poi` in a directory, it will use `index.js` or the file specified at `main` field in `package.json` as entry file of your application.

```bash
# Use `index.js` or `pkg.main`
$ poi
```

Then your application will be running at `http://localhost:4000`

![preview](https://i.loli.net/2018/03/27/5ab9f9699682b.png)

In most cases, you don't need to configure anything to make your app work with Poi, since Poi has great built-in support for:

- Babel, transform widely used ES next features to ES5, including JSX
- PostCSS, and a bunch of popular CSS pre-processors like Sass
- Vue, no config is required for your Vue applications
- etc..

You can dive into the [documentation](https://poi.js.org) for more information.

## Contributing

This project exists thanks to all the people who contribute.

Please make sure to read the [Contributing Guide](./CONTRIBUTING.md) before making a pull request.

## Author

**poi** © [EGOIST](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/egoist/poi/contributors)).

> [egoist.moe](https://egoist.moe) · GitHub [@egoist](https://github.com/egoist) · Twitter [@_egoistlily](https://twitter.com/_egoistlily)
