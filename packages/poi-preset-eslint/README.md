# poi-preset-eslint

## Install

```bash
yarn add poi-preset-eslint --dev
```

## Usage

To use eslint during building:

```bash
module.exports = options => {
  const presets = []

  if (options.mode === 'production') {
    presets.push(require('poi-preset-eslint')({
      // eslint-loader options
    }))
  }

  return {
    presets
  }
}
```

To config eslint, you can set `eslintConfig` in `package.json` or use a standalone config file like `.eslintrc`.
