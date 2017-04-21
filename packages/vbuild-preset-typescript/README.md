# vbuild-preset-typescript

## Install

```bash
yarn add typescript vbuild-preset-typescript --dev
```

## Configure

```js
{
  "vbuild": {
    "presets": [
      "typescript"
    ]
  }
}

// or with options for ts-loader
{
  "vbuild": {
    "presets": [
      ["typescript", options]
    ]
  }
}
```
