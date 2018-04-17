# Using Babel

Poi uses [babel-preset-poi](https://github.com/egoist/poi/blob/master/packages/babel-preset-poi/README.md) which includes following features:

- JSX (React / Vue / Custom)
- babel-preset-env (IE9+ or `node: 'current'` in test env)
- babel-macros
- transform-runtime
- dynamic-import
- object-rest-spread
- decorators-legacy
- class-properties

Please note that Poi supports React JSX by default, but you can change it to Vue JSX or any JSX pragma by using the `babel` option in config file:

```js
module.exports = {
  babel: {
    // Vue JSX
    jsx: 'vue',
    // Or `h` for preact
    jsx: 'h'
  }
}
```

However it's recommended to use `.babelrc` for this so that other tools like ESLint can use the same config.

## Transpile modules in `node_modules`

A module inside `node_modules` won't be transpiled by Babel, but you can still transpile certains modules if you want:

```js
module.exports = {
  babel: {
    // Include certain module names
    include: ['element-ready']
  }
}
```

## Using babel plugins

Because `.babelrc` doesn't allow callbacks, sometimes this is a only way to implement your ideas.

```js
module.exports = {
  babel: {
    config: {
      plugins: [
        // Using babel-plugin-import to import components and their styles on demand
        [require.resolve('babel-plugin-import'), {
          libraryName: 'fir-ui',
          style: componentName => `${componentName}.css`
        }]
      ]
    }
  }
}
```

## Using `.babelrc`

Poi will respect `.babelrc` or any kind of babel config file in current working directory (`process.cwd()`). It will use this file instead of the default `babel-preset-poi` when it's present.
