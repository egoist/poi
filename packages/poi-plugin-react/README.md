# poi-plugin-react

## Features

- Support React JSX by default
- react-hot-loader@3

## Install

```bash
yarn add react react-dom
yarn add poi-plugin-react --dev
```

## Usage

```js
module.exports = {
  plugins: [
    require('poi-plugin-react')()
  ]
}
```

> *Note*: You **don't** need to set `jsx: 'react'` in config to use this plugin.

## License

MIT &copy; [EGOIST](https://github.com/egoist)
