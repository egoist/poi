# Use Plugin

To use an official Poi plugin with optional options:

```js
module.exports = {
  plugins: [
    require('@poi/plugin-foo')(options)
  ]
}
```

Alternative format:

```js
module.exports = {
  // Object
  plugins: {
    '@poi/plugin-foo': options
  },
  // Array
  plugins: [
    ['@poi/plugin-foo', options],
    '@poi/plugin-bar'
  ]
}
```

__Unofficial Poi plugins follow the `poi-plugin-{name}` naming convention.__

```js
module.exports = {
  plugins: [
    // Following two are equivalent:
    'foo',
    'poi-plugin-foo'
  ]
}
```
