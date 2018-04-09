# plugin-buble

Use buble instead of babel to transpile `.js` `.es6` and script tag in `.vue` files

**ES2017 -> [buble](https://github.com/Rich-Harris/buble) -> [nodent](https://github.com/MatAtBread/nodent-compiler) for async/await -> ES5**

## Install

```bash
yarn add @poi/plugin-buble --dev
```

## Usage

```js
// poi.config.js
module.exports = {
  plugins: [
    require('@poi/plugin-buble')(/* options */)
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

## API

### options

#### options.asyncAwait

Transform `async/await` to pure `Promise` using [nodent](https://github.com/MatAtBread/nodent-compiler).

## License

[MIT](https://oss.ninja/mit/egoist) &copy; [EGOIST](https://github.com/egoist)
