# @poi/plugin-karma

Automatic (headless) browser testing with [Karma](https://karma-runner.github.io/latest/index.html).

## Introduction

This plugin pre-configures [Karma](https://karma-runner.github.io/), [Jasmine](https://jasmine.github.io/) for you so that you can run the tests without any configurations.

## Install

```bash
yarn add @poi/plugin-karma --dev
```

## How to use

In your `poi.config.js`:

```js
module.exports = {
  plugins: [
    {
      resolve: '@poi/plugin-karma'
    }
  ]
}
```

This plugin injected a new command to Poi CLI: `poi test:unit` which is a command running in Poi's `test` mode.

To run it easier, you can configure this in npm scripts:

```json
{
  "name": "my-project",
  "scripts": {
    "test": "poi test:unit",
    "build": "poi --prod",
    "start": "poi --serve"
  },
  "devDependencies": {
    "poi": "^12.0.0"
  }
}
```

Now you can run `npm test` instead.

### Test File Patterns

By default this plugin use `**/*.{test,spec}.{js,ts}` (excluded `node_modules`) as test files, you can change this to any minimatch pattern (note the quotes to avoid shell expansion):

```bash
poi test:unit "**/*.spec.coffee"
```

### Coverage Report

Use `--coverage` flag to show code coverage and generate coverage report to `./coverage` folder.

### Watching Files

Use `--watch` flag to watch test files.

### Running on CI

To run your tests in Continuous Integration Platforms like CircleCI, you will need `Chrome` installed in your test environment.
