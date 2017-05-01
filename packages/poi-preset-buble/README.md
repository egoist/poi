# poi-preset-buble

Use buble instead of babel to transpile `.js` `.es6` and script tag in `.vue` files

## Install

```bash
yarn add poi-preset-buble --dev
```

## Usage

```js
// poi.config.js
module.exports = {
  presets: [
    require('poi-preset-buble')(options)
    // options is for buble
  ]
}
```

Default Buble options:

```js
{
  transforms: {
    dangerousForOf: true,
    generator: false,
    modules: false
  },
  objectAssign: 'Object.assign'
}
```
