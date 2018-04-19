# plugin-typescript

## Install

```bash
yarn add typescript @poi/plugin-typescript --dev
```

## Usage

```js
// poi.config.js
module.exports = {
  plugins: [
    require('@poi/plugin-typescript')(/* options */)
  ]
}
```

You will also need a `tsconfig.json` in your project, to make it work in Vue project, please check out https://vuejs.org/v2/guide/typescript.html 

## API

### options

#### options.loaderOptions

Options for `ts-loader`.

#### options.tsChecker

Options for https://github.com/Realytics/fork-ts-checker-webpack-plugin

Default:

```js
{
  vue: true
}
```

## License

[MIT](https://oss.ninja/mit/egoist) &copy; [EGOIST](https://github.com/egoist)
