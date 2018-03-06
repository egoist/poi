# plugin-eslint

## Install

```bash
yarn add eslint @poi/plugin-eslint --dev
```

## Usage

To use eslint during building:

```js
module.exports = {
  plugins: [
    require('@poi/plugin-eslint')(/* options */)
  ]
}
```

By default this plugin is only activated in `poi build`.

To configure eslint, you can set `eslintConfig` in `package.json` or use a standalone config file like `.eslintrc`.

## API

### options

#### options.loaderOptions

Options for eslint-loader.

#### command

Type: `string` `string[]`<br>
Default: `build`

Run eslint in certain commands, you can also use `'*'` to run it in all commands.

## License

MIT © [EGOIST](https://github.com/egoist)
