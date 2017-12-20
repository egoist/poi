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

Then you can compile test files, by default it looks for `**/*.test.js` from the root, otherwise you could specify the directory by `--baseDir`:

```bash
poi test
# or somewhere else
poi test "src/*.test.js" "lib/*.spec.js"
# or from certain directory
poi test --baseDir "./test"
```

The default generated test files can be found at in place as `[name].transfromed.js`, you can finally run it with your favorite test framework like AVA:

```bash
poi test && ava ./test/example.test.transformed.js
```

If you want to bundle test files to certain directory, rather than at the same place as source. Please check the [outputDir](#outputdir) option below. 

**Note:** You might put `*.transfromed.js` in `.gitignore` file.

## Options

### testFiles

Type: `string` `Array`<br>
Default: `**/*.{test,spec}.js`

### ignoreFiles

Type: `Array`<br>
Default: `['!**/node_modules/**', '!**/vendor/**'])`

### baseDir

Type: `string`<br>
Default: `cwd`

The directory to search `testFiles`.

### outputDir

Type: `string`  
Default: `baseDir`

The directory of transfromed test files.
  
```js
// poi.config.js
module.exports = {
  presets: [
    require('poi-preset-transform-test-files')({
      outputDir: './test/_build'
    })
  ]
}
```

## LICENSE

MIT &copy; [EGOIST](https://github.com/egoist)
