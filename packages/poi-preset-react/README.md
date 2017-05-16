# poi-preset-react

## Features

- It uses the same Babel config that create-react-app uses
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

## Known issues

- Browser wouldn't get refreshed when new hmr updates are ready
