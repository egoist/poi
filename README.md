<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/8784712/23060768/1e3bea76-f53a-11e6-8735-998ee5f87238.png" alt="preview" />
</p>

## Badges

[![NPM version](https://img.shields.io/npm/v/vbuild.svg?style=flat-square)](https://npmjs.com/package/vbuild) [![NPM downloads](https://img.shields.io/npm/dm/vbuild.svg?style=flat-square)](https://npmjs.com/package/vbuild) [![Build Status](https://img.shields.io/circleci/project/egoist/vbuild/master.svg?style=flat-square)](https://circleci.com/gh/egoist/vbuild) [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat-square)](https://github.com/egoist/donate) [![twitter](https://img.shields.io/badge/twitter-@vbuildjs-1da1f2.svg?style=flat-square)](https://twitter.com/vbuildjs)

## tl;dr

```bash
vbuild dev whatever.js
# it just works
```

Develop web apps with no build configuration until you need.

## Install

It works with both Yarn(>=0.17) and npm(>=3):

```bash
yarn global add vbuild
# You can also install it locally
# yarn add vbuild --dev
```

Come from vbuild 6? Check out the 2-minute [migration guide](https://gist.github.com/egoist/e3caa03010e16be194c56af7c468edf5).

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

Run app in dev mode:

```bash
vbuild dev index.js
```

So far we get:

- Automatic transpilation and bundling (with webpack and babel/postcss)
- Hot code reloading
- Static file in `./static/` will be copied to `./dist/`

Build app in production mode (default mode):

```bash
vbuild index.js
```

**Note:** You can use vbuild with many frameworks easily, check out [examples](./examples).

**For full documentation, please head to https://vbuild.js.org**

## Who is using vbuild?

- [codepan](https://github.com/egoist/codepan) - Like codepen and jsbin but works offline.
- [jsx-editor](https://github.com/egoist/jsx-editor) - JSX Live Editor
- [vstar](https://github.com/sinchang/vstar) - A simple web app to show your or others GitHub repos stars
- Feel free to submit yours via pull request :D

## FAQ

<details><summary>Is it like Next.js or Nuxt.js?</summary>

Yes and no, yes is because they all simplified the process of building a complete web app, while `vbuild` is more focusing on building single-page app without the server-side, at least it is for now.
</details>

<details><summary>Is it like vue-cli?</summary>

No, vue-cli is just a boilerplate generator while vbuild is a Webpack wrapper which reduces boilerplate code for you.

You may notice that there's a `vue build` command lying in `vue-cli`, that's actually quite similar to vbuild, but providing less features and vbuild goes far beyond that.
</details>

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

**vbuild** © [EGOIST](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/egoist/vbuild/contributors)).

> [egoistian.com](https://egoistian.com) · GitHub [@egoist](https://github.com/egoist) · Twitter [@rem_rin_rin](https://twitter.com/rem_rin_rin)
