# @poi/plugin-typescript

Official TypeScript plugin for Poi.

## Introduction

This plugin use `ts-loader` to transpile TypeScript files, it also uses `fork-ts-checker-webpack-plugin` to perform type-checking. `.ts` `.tsx` and `.vue` files are supported.

It's possible to run Babel alongside TypeScript using the [babel](#babel) option. When used with Babel, it's recommended to set `compilerOptions.target` to `es2015` or later in `tsconfig.json` to delegate the rest to Babel for auto polyfill based on browser targets.

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

### babel

- Type: `boolean`
- Default: `false`

Use Babel after the TypeScript compiler.

### lintOnSave

- Type: `boolean`
- Default: `true`

Lint TS files with `ts-lint` at compile time, note that it will only work when you have a `tslint.json` in your project root.

### configFile

- Type: `string`
- Default: `tsconfig.json`

The path to the TypeScript config file.

### loaderOptions

- Type: `any`

Addtional [options](https://github.com/TypeStrong/ts-loader#loader-options) for `ts-loader`.

### tscheckerOptions

- Type: `any`

Additional [options](https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#options) for `fork-ts-checker-webpack-plugin`.
