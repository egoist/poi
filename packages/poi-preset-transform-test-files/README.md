# poi-preset-transform-test-files

How does this work:

- Transform your test files with Poi.
- Run custom test framework against transformed test file.

## Install

```bash
yarn add poi-preset-transform-test-files --dev
```

## Usage

Activate it in config file:

```js
// poi.config.js
module.exports = {
  presets: [
    require('poi-preset-transform-test-files')(/* options */)
  ]
}
```

Then you can compile test files, by default it looks for `**/*.test.js`:

```bash
poi test
# or somewhere else
poi test "src/*.test.js" "lib/*.spec.js"
```

The default generated test files can be found at `./output_test/test.js`, you can finally run it with your favorite test framework like AVA:

```bash
poi test && ava output_test/test.js
```

if you want to build test files separately, rather than bundling as one file. Please check the `options.inPlaceTransform` below. 

**Note:** You might put `output_test` in `.gitignore` file, when using default setting.

## Options

### inPlaceTransform

Type: `Boolean`|`String`
Default: `false`

if it is `true`, the test file would generated in place as `[name].transfrom.js`,

```bash
poi test && ava *.test.transform.js
```

Otherwise, you can follow the [rule](https://webpack.js.org/configuration/output/#output-filename) of Webpack filename to specify filename as you want in string format.

**Note:** You might put `*.test.transform.js` in `.gitignore` file, when setting `inPlaceTransform` as true.

## LICENSE

MIT &copy; [EGOIST](https://github.com/egoist)
