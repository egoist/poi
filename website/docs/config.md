---
sidebar: auto
---

# Config Reference

Poi will search `poi.config.js` or `poi` property in `package.json` from your [base directory](cli.md#base-directory), when not found it will search parent directory until reaching `process.cwd()`.

The config is essentially a pure object containing following properties.

```js
// Access the current Poi command
process.env.POI_COMMAND
// "build" "dev" etc..

module.exports = {
  // ...config
}
```

## entry

- Type: `string` `string[]`
- Default: `index.js`

The entry files of your app. If a relative path is given, it's resolved from [base directory](cli.md#base-directory).

## outDir

- Type: `string`
- Default: `dist`.

The directory to write generated files. If a relative path is given, it's resolved from [base directory](cli.md#base-directory).

## publicPath

- Type: `string`
- Default: `/`

Specify public URL of the output directory when referenced in a browser. A relative URL is resolved relative to the HTML page (or `<base>` tag). Server-relative URLs, protocol-relative URLs or absolute URLs are also possible and sometimes required, i. e. when hosting assets on a CDN.

The value of the option is prefixed to every URL created by the runtime or loaders. Because of this the value of this option ends with `/` in most cases.

## pages

- Type: `Object`

Customize the pages, for example you can configure this to build your app in multi-page mode. The value should be an object where the key is the name of the page, the value is an object used to customize the page.

By default we only have an `index` page which generates `index.html`. The default value is as follows:

```js
module.exports = {
  pages: {
    index: {
      entry: config.entry,
      title: pkg.name || 'Poi App',
      filename: 'index.html',
      template: 'public/index.html',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
  }
}
```

Properties:

- `entry`: **required**. The entry files of this page, like [config.entry](#entry) option it should be either `string` or an array of `string`. For `index` page, it will use [config.entry](#entry) as the default value.
- `title`: The title that is used in `<title></title>` in the generated HTML file. For `index` page it defaults to `pkg.title || 'Poi App'` where the `pkg` the data of your project's `package.json`.
- `filename`: The filename of generated HTML file, it default to `$page_name + '.html'` where `$page_name` is the name of the page.
- `template`: The template HTML file that is used to render the generated HTML file. If not given, a default template file will be used.
- `chunks`: Include specific chunks in this page. Pages by default will always generate a `$page_name` chunk, optionally with `chunk-vendors` chunk and `chunk-common` chunk in production build.

## constants

- Type: `Object`

Create global constants which can be configured at compile time.

## sourceMap

- Type: `boolean`
- Default: `true`

Whether to generate sourcemaps for `.js` and `.css` files

Generating sourcemaps in production build is useful for error reporting, analysing bundle size etc. However if you don't want sourcemaps, you can feel free to disable it.

## minimize

- Type: `boolean`
- Default: `true` in production build, `false` otherwise

Minimize bundled JS and CSS files.

## css.extract

- Type: `boolean`
- Default: `true` in production mode, `false` otherwise

Whether to extract CSS into standalone `.css` files.

## css.loaderOptions

- Type: `Object`

Specify custom options for the CSS loaders:

```js
module.exports = {
  css: {
    loaderOptions: {
      // For sass-loader
      sass: {},
      // For stylus-loader
      stylus: {},
      // For less-loader
      less: {}
    }
  }
}
```