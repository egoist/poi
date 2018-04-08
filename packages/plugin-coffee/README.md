# plugin-coffee

Use CoffeeScript in your Poi project.

## Install

```bash
yarn add coffeescript @poi/plugin-coffee --dev
```

## Usage

```js
// poi.config.js
module.exports = {
  plugins: [
    require('@poi/plugin-coffee')(options)
  ]
}
```

**Notes:**

-   To use in Vue SFC, set `lang="coffee"` or `lang="coffeescript"`:

```vue
<script lang="coffee">
export default
  data: ->
    foo: 'foo'
</script>
```

## API

### options

#### options.loaderOptions

Options for [better-coffee-loader](https://github.com/egoist/better-coffee-loader#options).

## License

[MIT](https://oss.ninja/mit/egoist) &copy; [EGOIST](https://github.com/egoist)
