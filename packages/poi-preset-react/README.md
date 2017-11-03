# poi-preset-react

## Features

- Switched to React JSX, plus:
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
