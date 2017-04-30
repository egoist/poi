# poi-preset-buble

Use buble instead of babel to transpile `.js` `.es6` and script tag in `.vue` files

## Install

```bash
yarn add poi-preset-buble --dev
```

## Usage

```js
{
  "poi": {
    "presets": [
      ["buble", bubleLoaderOptions]
    ]
  }
}
```

Default Buble options:

```js
{
  transforms: {
    dangerousForOf: true,
    generator: false,
  },
  objectAssign: 'Object.assign'
}
```
