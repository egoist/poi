# poi-preset-react

## Features

- Support React JSX by default
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

> *Note*: You **don't** need to set `jsx: 'react'` in config to use this preset.

## License

MIT &copy; [EGOIST](https://github.com/egoist)
