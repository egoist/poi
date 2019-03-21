# @poi/plugin-typescript

Official TypeScript plugin for Poi.

## Introduction

This plugin use `ts-loader` to transpile TypeScript files, it also uses `fork-ts-checker-webpack-plugin` to perform type-checking. `.ts` `.tsx` and `.vue` files are supported.

## Install

```bash
yarn add @poi/plugin-typescript typescript --dev
```

## How to use

```js
module.exports = {
  plugins: [
    {
      resolve: '@poi/plugin-typescript',
      options: {}
    }
  ]
}
```

Then add a `tsconfig.json` in your project:

```json
{
  "compilerOptions": {
    "target": "es5",
    "strict": true,
    "module": "es2015",
    "moduleResolution": "node"
  }
}
```

## Options

### lintOnSave

- Type: `boolean`
- Default: `true`

Lint TS files with `ts-lint` at compile time when a `tslint.json` is found in your project

### configFile

- Type: `string`
- Default: `tsconfig.json`

The path to the TypeScript config file.

### loaderOptions

- Type: `any`

Addtional options for `ts-loader.
