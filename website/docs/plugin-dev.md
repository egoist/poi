---
sidebar: auto
---

# Plugin Dev Guide

## Overview

A plugin is essential an object with some properties or methods like `name`, `extend`, `generators` etc.

```js
exports.name = 'foo'

exports.extend = (api, options) => {
  // ...
}

exports.generators = {
  foo: {}
}
```

## Properties and Methods

### name

- __Type__: `string`
- __Required__: `true`

The plugin name, it's mainly used to retrieve plugin options from config file. For example if the name is `foo`, then we will use `pluginOptions.foo` from config file as the second argument of the [`extend`](#extend) method.

### extend

- __Type__: `(api: PluginAPI, options: any) => void`
- __Required__: `false`

### generators

See the [Generators](#generators-2) section.

### commandModes

- __Type__: `{ [command: string]: string }`

Set the mode for the commands added via the plugin. For example we set the mode to `production` in the plugin that adds the `build` command:

```js
exports.commandModes = {
  build: 'production'
}
```

## Plugin API

### api.mode

- Type: `string`

Get the mode that the bundler is running under.

### api.chainWebpack

Using [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain) to modify internal webpack config.

```js
api.chainWebpack(config => {
  // `config` is a webpack-chain instance
})
```

### api.configureDevServer

Extending the dev server ([Express](https://expressjs.com/en/4x/api.html#app)) instance.

```js
api.configureDevServer(server => {
  server.get('/foo', (req, res) => res.send('foo'))
})
```

### api.resolve

Resolve path from base directory.

```js
api.resolve('foo.js')
```

## Generators

You can use `generators` property to add multiple generators:

```ts
exports.generators = {
  foo: {
    // inqurer.js prompts object
    prompts: Prompt[],
    generate(api: GenerateAPI): Promise<void>,
    // Whether to invoke this generator
    // When the plugin is added via `poi add` command
    invokeAfterAdd: boolean,
    // Whether to run npm install when generated
    npmInstall: boolean
  }
}
```

Then a user who installed this plugin can run `poi invoke foo` to invoke this generator.