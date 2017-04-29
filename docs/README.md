<p class="warning">
  If you're looking docs for Poi 6, please visit https://poi6.surge.sh, this is the docs for Poi latest version.
</p>

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/8784712/23060768/1e3bea76-f53a-11e6-8735-998ee5f87238.png" alt="preview" />
</p>

## Badges

[![NPM version](https://img.shields.io/npm/v/poi.svg?style=flat-square)](https://npmjs.com/package/poi) [![NPM downloads](https://img.shields.io/npm/dm/poi.svg?style=flat-square)](https://npmjs.com/package/poi) [![Build Status](https://img.shields.io/circleci/project/egoist/poi/master.svg?style=flat-square)](https://circleci.com/gh/egoist/poi) [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat-square)](https://github.com/egoist/donate) [![twitter](https://img.shields.io/badge/twitter-@poijs-1da1f2.svg?style=flat-square)](https://twitter.com/poijs)

## tl;dr

```bash
poi dev whatever.js
# it just works
```

Develop web apps with no build configuration until you need.

## Config file

All CLI options and advanced options can be set here:

```js
module.exports = (options, req) => ({
  entry: './src/index.js'
  // Other options
})

// Note that you can directly export an object too:
// module.exports = { devServer: { port: 5000 } }
```

By default it will load `poi.config.js` if it exists. To change the path, you can add `--config [path]` in CLI arguments. 

You can also use `.poirc` or set `poi` property in `package.json` when you only need JSON for configurations. See [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) for all the supported config files.

[⬆ back to top](#app)

### Arguments

#### options

CLI options.

[⬆ back to top](#app)

#### req

The `require` function but context directory is the path to `node_modules/poi/lib`, which means you can use it to load poi's dependencies, like `webpack`.

[⬆ back to top](#app)

### Babel

JS files and `script` tags in single-file components are transpiled by Babel. We only use one preset by default: [babel-preset-vue-app](https://github.com/egoist/babel-preset-vue-app).

poi will use `.babelrc` if it exists, you can also set `babelrc` option in config file to disable itself, check out [full reference](https://babeljs.io/docs/usage/api/#options) for `babel` option.

Feel free to use [babel-preset-react-app](https://github.com/facebookincubator/create-react-app/blob/master/packages/babel-preset-react-app) or [babel-preset-preact-app](https://github.com/developit/babel-preset-preact) and so on to work with other frameworks.

[⬆ back to top](#app)

### PostCSS

Standalone `.css` files and `style` tags in single-file components are transpiled by PostCSS, the only plugin we use by default is `autoprefixer`, and you can use `autoprefixer` option in config file to adjust it, here's the config with default value:

```js
module.exports = {
  autoprefixer: {
    browsers: ['ie > 8', 'last 3 versions']
  }
}
```

You can use PostCSS config file like `postcss.config.js` or whatever [postcss-load-config](https://github.com/michael-ciniawsky/postcss-load-config) supports. `postcss` option is also available in config file.

#### Custom CSS preprocessors

Supported preprocessors: `sass` `scss` `stylus` `less`, the workflow of CSS is `custom css preprocessor` -> `postcss-loader` -> `css-loader`.

To use a custom CSS preprocessor, you can directly install relevant loader and dependency. For example, to use `scss`:

```bash
yarn add node-sass sass-loader --dev
```

#### CSS modules

To use CSS modules in single-file component, you can set `module` attribute in `<style></style>` tag.

To use CSS modules in standalone css files, you can set `cssModules` to `true` in config file.

[⬆ back to top](#app)

### Vue

As a fact that we're using `babel-preset-vue-app` by default, you will have built-in support for Vue JSX.

Besides this, single-file component (hot reload, preprocessors, css extraction) is fully supported.

[⬆ back to top](#app)

### Webpack entry

Type: `string` `Array` `Object`

You can set webpack entry from CLI option or `entry` property in config file. If it's an array or string, we add it into `webpackConfig.entry.client` entry, otherwise it will totally override `webpackConfig.entry`

[⬆ back to top](#app)

### Code splitting

We enabled code splitting for vendor code and app code by default in production mode, you can set `vendor` option to `false` to disable it. And by default all required modules in `node_modules` will be split.

[⬆ back to top](#app)

### Webpack

You can directly mutate webpack config via `webpack` options:

```js
module.exports = {
  webpack(config) {
    config.plugins.push(new MyWebpackPlugin())
    return config // <-- Important, must return it
  }
}
```

Or change webpack config using [webpack-chain](https://github.com/mozilla-rpweb/webpack-chain):

```js
module.exports = {
  extendWebpack(config) {
    // Disable progress bar while building
    config.plugins.delete('progress-bar')
  }
}
```

Using webpack-chain is more verbose but you gain more control with it.

[⬆ back to top](#app)

### Custom HTML output

Type: `Object` `Array` `boolean`

[html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin) options, use this option to customize generated `index.html`, default value:

```js
module.exports = {
  html: {
    // `pkg` indicates the data in `package.json`
    title: pkg.productName || pkg.name,
    description: pkg.description,
    template: // defaults to $cwd/index.html if it exists, otherwise use built-in template
  }
}
```

Check out the [built-in template](https://github.com/egoist/poi/blob/master/packages/poi/lib/index.html) file we use. To disable generating html file, you can set `html` to `false`.

The options for html-webpack-plugin are available in template file as `htmlWebpackPlugin.options` and you can use `htmlWebpackPlugin.options.pkg` to access the data of `package.json`.

[⬆ back to top](#app)

### Custom output filename

Set custom filename for js css static files:

```js
module.exports = {
  filename: {
    js: 'index.js',
    css: 'style.css',
    static: 'static/[name].[ext]',
    chunk: '[id].chunk.js'
  }
}
```

[⬆ back to top](#app)

### Extracting CSS

The `extractCSS` option is `true` by default in production mode, however you can also set it manually to overrde:

```js
module.exports = {
  // always disable extracting css
  extractCSS: false
}
```

[⬆ back to top](#app)

### Copy static files

By default, all files inside `./static` folder will be copied to dist folder, you can set `copy` to `false` to disable this.

[⬆ back to top](#app)

### Define env variables

By default you will have `process.env.NODE_ENV` defined.

There're two ways to define env variables:

- CLI options `--env.VARIABLE_NAME xxx`
- `env` option in config file

For example, when you have such configs:

```js
module.exports = {
  env: {
    APP_DESCRIPTION: 'my superb app'
  }
}
```

The value of each env variable is automatically stringified and passed down to [webpack.DefinePlugin](https://webpack.js.org/plugins/define-plugin/).

In your app:

```js
const description = process.env.APP_DESCRIPTION
// do something
```

In template html file which uses [lodash.template](https://lodash.com/docs/4.17.4#template) syntax, you can also access it under `htmlWebpackPlugin.options.env`:

```html
<meta name="description" content="<%= htmlWebpackPlugin.options.env.APP_DESCRIPTION %>" />
```

[⬆ back to top](#app)

### Proxy API request

To tell the development server to serve any `/api/*` request to your API server in development, use the `proxy` options:

```js
module.exports = {
  proxy: 'http://localhost:8080/api'
}
```

This way, when you fetch `/api/todos` in your app, the development server will proxy your request to `http://localhost:8080/api/todos`.

We use [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware) under the hood, so the `proxy` option can also be an object:

```js
module.exports = {
  proxy: {
    '/api/foo': 'http://localhost:8080/api',
    '/api/fake-data': {
      target: 'http://jsonplaceholder.typicode.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/fake-data': ''
      }
    }
  }
}
```

Keep in mind that proxy only has effect in development.

[⬆ back to top](#app)

### Dev server

#### port

Type: `number`<br>
Default: `4000`

Port of dev server.

#### host

Type: `string`<br>
Default: `localhost`

Host of dev server.

[⬆ back to top](#app)

### Custom server logic

Perform some custom logic to development server:

```js
module.exports = {
  setupDevServer(app) {
    app.get('/api', (req, res) => {
      res.end('This is the API')
    })
  }
}
```

[⬆ back to top](#app)
