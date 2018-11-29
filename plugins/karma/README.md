# @poi/plugin-karma

Automatic (headless) browser testing with [Karma](https://karma-runner.github.io/latest/index.html).

## Introduction

This plugin pre-configures [Karma](https://karma-runner.github.io/), [Jasmine](https://jasmine.github.io/) for you so that you can run the tests without any configurations.

## Install

```bash
yarn add @poi/plugin-karma@next --dev
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

This plugin injected a new command to Poi CLI: `poi karma`, however you should always use `poi karma --test` to run your tests in `test` mode.

To run it easier, you can configure this in npm scripts:

```json
{
  "name": "my-project",
  "scripts": {
    "test": "poi karma --test",
    "build": "poi --prod",
    "start": "poi --serve"
  },
  "devDependencies": {
    "poi": "next"
  }
}
```

Now you can run `npm test` instead.
