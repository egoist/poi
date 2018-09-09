# Transforms

In Poi, you can reference a file in another one, they are so-called assets. For many kinds of assets, Poi will perform proper transformations, e.g. transform ES2015 syntax to ES5 using Babel.

Here's a list of all built-in transforms:

|Type|Associated Extension(s)|
|---|---|
|JavaScript|`.js` `.jsx`|
|Vue|`.vue`|
|GraphQL|`.gql` `.graphql`|
|YAML|`.yml` `.yaml`|
|TOML|`.toml`|
|JSON|`.json`|
|ReasonML|`.re`|
|CSS|`.css`|
|SCSS|`.scss`|
|SASS|`.sass`|
|LESS|`.less`|
|Stylus|`.styl` `.stylus`|
|CSS modules|`.module.{css,less,styl,stylus,sass,scss}`|


## JavaScript

JavaScript is transpiled by [Babel](https://babeljs.io/docs/en) which is a toolchain that is mainly used to convert ECMAScript 2015+ code into a backwards compatible version of JavaScript in old browsers or environments.

When Babel config file was not found in the base directory, Poi will use a default [Babel preset](https://babeljs.io/docs/en/plugins#presets) which includes many useful plugins for building a modern web app:

- Env preset
- JSX support (React, Vue or custom JSX pragma)
- Dynamic import
- Class properties
- Transform runime

:::tip
Poi uses babel.config.js which is a new config format in Babel 7. Unlike `.babelrc` or the `babel` field in package.json, this config file does not use a file-location based resolution, and is applied consistently to any file under project root, including dependencies inside node_modules. It is recommended to always use `babel.config.js` instead of other formats in Poi projects.
:::

### Preset Options

You can use the default preset with some customzations:

```js
// babel.config.js
module.exports = {
  presets: [
    ['module:poi/babel', options]
  ]
}
```

#### options.jsx

- Type: `string`
- Default: `'react'`