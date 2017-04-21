# vbuild-preset-buble

Use buble instead of babel to transpile `.js` `.es6` and script tag in `.vue` files

## Install

```bash
yarn add vbuild-preset-buble --dev
```

## Usage

```js
{
  "vbuild": {
    "presets": [
      ["buble", bubleLoaderOptions]
    ]
  }
}
```
