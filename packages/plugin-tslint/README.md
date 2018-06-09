# plugin-tslint

## Install

```bash
yarn add tslint @poi/plugin-tslint --dev
```

## Usage

To use tslint during building:

```js
module.exports = {
  plugins: [
    require('@poi/plugin-tslint')(/* options */)
  ]
}
```

By default this plugin is only activated in `poi build`.

To configure tslint, you can use a standalone config file `tslint.json`.

## API

### options

#### options.loaderOptions

Options for tslint-loader.

#### command

Type: `string` `string[]`<br>
Default: `build`

Run tslint in certain commands, you can also use `'*'` to run it in all commands.

## License

[MIT](https://oss.ninja/mit/egoist) &copy; [EGOIST](https://github.com/egoist)
