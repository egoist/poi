<p align="center">
  <img src="https://ooo.0o0.ooo/2017/04/30/5905ba6f1f3ee.png" alt="preview" />
</p>

## Badges

[![NPM version](https://img.shields.io/npm/v/poi.svg?style=flat-square)](https://npmjs.com/package/poi) [![NPM downloads](https://img.shields.io/npm/dm/poi.svg?style=flat-square)](https://npmjs.com/package/poi) [![Build Status](https://img.shields.io/circleci/project/egoist/poi/master.svg?style=flat-square)](https://circleci.com/gh/egoist/poi) [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat-square)](https://github.com/egoist/donate) [![twitter](https://img.shields.io/badge/twitter-@poijs-1da1f2.svg?style=flat-square)](https://twitter.com/poijs)

## Introduction

Start writing an app with a single `.js` file, Poi could handle all the development setups for you, no more configuration hell.

One devDependency to rule them all:

```bash
# Either globally
yarn global add poi
# Or locally (preferred)
yarn add poi --dev
```

Then populating an `index.js` and writing with your faviorite framework like one of:

<p>
<details><summary>React / Preact</summary><br>

```js
import React from 'react'
import { render } from 'react-dom'

const App = () => <h1>Hello React.</h1>

render(<App />, document.getElementById('app'))
```

Note: You need to install `react` `react-dom` and desired babel preset like `babel-preset-react-app`.

It's similar for other React-like framework.
</details>

<details><summary>Vue</summary><br>

```js
import Vue from 'vue'

new Vue({
  el: '#app',
  render() {
    return <h1>Hello Vue.</h1>
  }
})
```

Note: You don't need to install any dependencies, `vue` is already brought by `Poi`. And single-file component is also supported by default.
</details>

<details><summary>Other</summary><br>

You can write your app with any framework :P
</details>
</p>

To develop this file, run `poi` in your terminal and you can open `http://localhost:4000` to preview!

So far we get:

- Automatic transpilation and bundling (with webpack and babel/postcss)
- Hot code reloading
- Static file in `./static/` is served as static files.

Build app in production mode (optimized and minified):

```bash
poi build
```

To change the path of entry file:

```bash
poi src/my-entry.js # development
poi build src/my-entry.js # production
```

**For full documentation, please head to https://poi.js.org**

## Who is using Poi?

- [codepan](https://github.com/egoist/codepan) - Like codepen and jsbin but works offline.
- [jsx-editor](https://github.com/egoist/jsx-editor) - JSX Live Editor
- [vstar](https://github.com/sinchang/vstar) - A simple web app to show your or others GitHub repos stars
- [npmarket](https://github.com/qingwei-li/npmarket) - More efficient search for node packages
- [sublog](https://github.com/sinchang/sublog) - Build a static blog website from GitHub Issues
- Feel free to submit yours via pull request :D

## FAQ

<details><summary>Is it like Yeoman?</summary><br>

No, Yeoman is just a boilerplate generator while Poi is a Webpack wrapper which reduces boilerplate code for you.
</details>

<details><summary>Is it like create-react-app?</summary><br>

Yes and No.

Yes is because they both simplify the development setup, but `create-react-app` is tied to `React` ecosystem and could not be configured programmatically using config file.
</details>

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

**poi** © [EGOIST](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/egoist/poi/contributors)).

> [egoistian.com](https://egoistian.com) · GitHub [@egoist](https://github.com/egoist) · Twitter [@rem_rin_rin](https://twitter.com/rem_rin_rin)
