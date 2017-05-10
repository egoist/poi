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
    require('poi-preset-transform-test-files')()
  ]
}
```

Then you can compile test files, by default it looks for `**/*.test.js`:

```bash
poi test
# or somewhere else
poi test "src/*.test.js" "lib/*.spec.js"
```

The generated test files can be found at `./output_test/test.js`, you can finally run it with your favorite test framework like AVA:

```bash
poi test && ava output_test/test.js
```

**Note:** You might put `output_test` in `.gitignore` file.

## LICENSE

MIT &copy; [EGOIST](https://github.com/egoist)
