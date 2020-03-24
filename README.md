<p align="center">
  <img src="https://i.loli.net/2018/09/12/5b98e77352c9d.png" width="200">
  </p>
<br>

[![npm version](https://badgen.net/npm/v/poi)](https://npm.im/poi) [![build status](https://badgen.net/circleci/github/egoist/poi/master)](https://circleci.com/gh/egoist/poi/tree/master) [![npm downloads](https://badgen.net/npm/dm/poi)](https://npm.im/poi) [![poi twitter](https://badgen.net/badge//@poi__js/1da1f2?icon=twitter)](https://twitter.com/poi__js)

[![poi-service](https://user-images.githubusercontent.com/8784712/77440987-e8640080-6e23-11ea-84f6-fa13a5c9b235.png)](https://cp.xscode.com/egoist/poi)

Poi is a bundler built on the top of webpack, trying to make developing and bundling apps with webpack as easy as possible.

**The Poi project is supported by our [Backers](./BACKERS.md) and funded through [Patreon](https://patreon.com/egoist).**

## Features

- 📦 Out of box support for JS, CSS, File assets and more.
- ⚛ Framework-agnostic but also support JSX, Vue and more with no configs.
- 🔌 Great extensibility.
- 🐙 Fits most web apps, npm libs.
- 🚨 Great development experience.

## Quick Overview

Before we get started, ensure that you have installed Node.js (>=8) and Yarn (or npm) on your machine.

### Get Started Immediately

```bash
yarn global add create-poi-app
create-poi-app my-app

cd my-app
npm run dev
```

Then open http://localhost:4000 to see your app.<br>
When you’re ready to deploy to production, create a minified bundle with `npm run build`.

### Get Started Manually

Inside an empty project, run `yarn init` or `npm init` to create a `package.json` and install Poi:

```bash
yarn init
yarn add poi --dev
```

Now all you need is to create an entry file, like if you're building a website, just create an `index.js`:

```js
const el = document.createElement('div')
el.textContent = 'Hello Poi!'

document.body.appendChild(el)
```

Now if you run:

```bash
yarn poi --serve
```

You will get a URL like `http://localhost:4000` which you can open to preview the app.

Next let's start adding some dependencies like a CSS file `style.module.css`:

```css
.title {
  color: pink;
}
```

```js
import styles from './style.module.css'

const el = document.createElement('div')
el.className = styles.title
el.textContent = 'Hello Poi!'

document.body.appendChild(el)
```

Save it and the browser will automatically reload to apply the changes!

## Documentation

📚 https://poi.js.org

You can improve it by sending pull requests to [this repository](https://github.com/poi-bundler/website).

Check out [this repository](https://github.com/poi-bundler/examples) for more examples.

## Community

All feedback and suggestions are welcome!

- 💬 Join the community on [Spectrum](https://spectrum.chat/poi).
- 📣 Stay up to date on new features and announcements on [Twitter @poi\_\_js](https://twitter.com/poi__js).

## Credits

Poi v12 wouldn't exist without the inspirations from following projects:

- Webpack
- Parcel 2
- Poi itself
- Vue CLI 3
- Create React App

## License

MIT &copy; [EGOIST](https://egoist.sh)
