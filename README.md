<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/8784712/25625476/2fdc3e2c-2f8f-11e7-98d0-5653e44b1d2b.png" alt="preview" />
</p>

## Badges

[![NPM version](https://img.shields.io/npm/v/poi.svg?style=flat-square)](https://npmjs.com/package/poi) [![NPM downloads](https://img.shields.io/npm/dm/poi.svg?style=flat-square)](https://npmjs.com/package/poi) [![Build Status](https://img.shields.io/circleci/project/egoist/poi/master.svg?style=flat-square)](https://circleci.com/gh/egoist/poi) [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat-square)](https://github.com/egoist/donate) [![chat](https://img.shields.io/badge/chat-on%20discord-7289DA.svg?style=flat-square)](https://chat.egoist.moe)

## Introduction

Start writing an app with a single `.js` file, Poi could handle all the development setups for you, no more configuration hell.

Install *Poi*:

```bash
# Either globally
yarn global add poi
# Or locally (preferred)
yarn add poi --dev
```

Then populating an `index.js` and writing with your favorite framework like one of:

<p>
<details><summary>React / Preact</summary><br>

```js
import React from 'react'
import { render } from 'react-dom'

const App = () => <h1>Hello React.</h1>

render(<App />, document.getElementById('app'))
```

Note: You need to install `react` `react-dom` and add [`jsx: 'react'`](https://poi.js.org/#/options?id=jsx) in Poi's config file. For convenience, here's also [poi-preset-react](https://github.com/egoist/poi/tree/master/packages/poi-preset-react) which adds both React JSX and React HMR support.

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

You can use existing [presets](https://github.com/egoist/poi/tree/master/packages) such as [poi-preset-riot](https://github.com/egoist/poi/tree/master/packages/poi-preset-riot) and [poi-preset-react](https://github.com/egoist/poi/tree/master/packages/poi-preset-react) to configure your framework to work with `Poi`, or contribute another preset for your desired framework.

</details>
</p>

To develop this file, run `poi` in your terminal and you can open `http://localhost:4000` to preview!

So far we get:

- Automatic transpilation and bundling (with webpack and babel/postcss)
- Hot code reloading
- Files in `./static` are copied to dist folder, eg. `static/favicon.ico` to `dist/favicon.ico`

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
- [jsx-editor](https://github.com/egoist/jsx-editor) - JSX Live Editor.
- [vstar](https://github.com/sinchang/vstar) - A simple web app to show your or others GitHub repos stars.
- [npmarket](https://github.com/qingwei-li/npmarket) - More efficient search for node packages.
- [sublog](https://github.com/sinchang/sublog) - Build a static blog website from GitHub Issues.
- [emoji.js.org](https://emoji.js.org) - Unfancy emoji searcher.
- [ANII](https://github.com/egoist/anii) - A minimalistic web video player.
- [WhyVote.us](http://whyvote.us) - Info about the American presidential voting system.
- Feel free to submit yours via pull request :D

## FAQ

<details><summary>How's it different from a boilerplate?</summary><br>

It's hard to upgrade your project if you're using a boilerplate since you might change the code to suit your needs. However you can easily upgrade your project to use latest version of Poi by simply updating the dependency.

You can also get rid of boilerplate code in this way.
</details>

<details><summary>How does Poi manage dependencies for external frameworks?</summary><br>

`Vue` is included, other frameworks need to be installed alongside `Poi` in your project.
</details>

<details><summary>How to upgrade my app?</summary><br>

You can simply update poi and poi presets in your project, sometimes you might need `yarn remove poi && yarn add poi --dev` to ensure that poi's dependencies are updated too if you're using Yarn.
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

> [egoistian.com](https://egoistian.com) · GitHub [@egoist](https://github.com/egoist) · Twitter [@_egoistlily](https://twitter.com/_egoistlily)

<a target='_blank' rel='nofollow' href='https://app.codesponsor.io/link/Ux4hdW1RzN8XpYzVUoWJFxg9/egoist/poi'>  <img alt='Sponsor' width='888' height='68' src='https://app.codesponsor.io/embed/Ux4hdW1RzN8XpYzVUoWJFxg9/egoist/poi.svg' /></a>
