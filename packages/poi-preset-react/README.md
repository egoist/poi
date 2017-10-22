# poi-preset-react

## Features

- Better default babel presets and plugins for React app
  - [babel-preset-react-app](https://github.com/facebookincubator/create-react-app/tree/master/packages/babel-preset-react-app) which is used by create-react-app.
  - [babel-plugin-react-require](https://github.com/vslinko/babel-plugin-react-require) to add React import declaration if file contains JSX tags.
  - You can override the defaults with a `.babelrc` file.
- react-hot-loader@3

## Install

```bash
yarn add react react-dom
yarn add poi-preset-react --dev
```

## Usage

```js
module.exports = {
  presets: [
    require('poi-preset-react')()
  ]
}
```
