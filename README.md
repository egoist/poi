<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/8784712/23060768/1e3bea76-f53a-11e6-8735-998ee5f87238.png" alt="preview" />
</p>

## Badges

[![NPM version](https://img.shields.io/npm/v/poi.svg?style=flat-square)](https://npmjs.com/package/poi) [![NPM downloads](https://img.shields.io/npm/dm/poi.svg?style=flat-square)](https://npmjs.com/package/poi) [![Build Status](https://img.shields.io/circleci/project/egoist/poi/master.svg?style=flat-square)](https://circleci.com/gh/egoist/poi) [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat-square)](https://github.com/egoist/donate) [![twitter](https://img.shields.io/badge/twitter-@poijs-1da1f2.svg?style=flat-square)](https://twitter.com/poijs)

## tl;dr

```bash
poi whatever.js
# it just works
```

Develop web apps with no build configuration until you need.

## Install

It works with both Yarn(>=0.17) and npm(>=3):

```bash
yarn global add poi
# You can also install it locally
# yarn add poi --dev
```

Come from Poi 6? Check out the 2-minute [migration guide](https://gist.github.com/egoist/e3caa03010e16be194c56af7c468edf5).

## How to use

Populate an entry file, let's say `index.js`:

```js
import Vue from 'vue'

new Vue({
  el: '#app',
  render(h) {
    return h('h1', 'hello world')
  }
})
```

Run app in dev mode (default mode):

```bash
poi index.js
```

So far we get:

- Automatic transpilation and bundling (with webpack and babel/postcss)
- Hot code reloading
- Static file in `./static/` will be copied to `./dist/`

Build app in production mode (optimized and minified):

```bash
poi build index.js
```

**Note:** You can use Poi with many frameworks easily, check out [examples](./examples).

**For full documentation, please head to https://poi.js.org**

## Who is using poi?

- [codepan](https://github.com/egoist/codepan) - Like codepen and jsbin but works offline.
- [jsx-editor](https://github.com/egoist/jsx-editor) - JSX Live Editor
- [vstar](https://github.com/sinchang/vstar) - A simple web app to show your or others GitHub repos stars
- [npmarket](https://github.com/qingwei-li/npmarket) - More efficient search for node packages
- [sublog](https://github.com/sinchang/sublog) - Build a static blog website from GitHub Issues
- Feel free to submit yours via pull request :D

## FAQ

<details><summary>What does <strong>Poi</strong> mean?</summary><br>

<img src="https://img.moegirl.org/common/b/bd/%E5%A6%96%E6%A2%A6poi.jpg" width="200" />

First of all, it's Poi, not POI or poi.

Poi is usually used to express emotions like `I don't know why but it actually works this way.` Thinking of such conversation:

> How's it going?<br>
> Not bad, Poi.<br>
> What's that? Poi?<br>
> No idea, sounds cute though, Poi!

</details>

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
