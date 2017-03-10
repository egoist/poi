<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/8784712/23060768/1e3bea76-f53a-11e6-8735-998ee5f87238.png" alt="preview" />
</p>

## Badges

[![NPM version](https://img.shields.io/npm/v/vbuild.svg?style=flat-square)](https://npmjs.com/package/vbuild) [![NPM downloads](https://img.shields.io/npm/dm/vbuild.svg?style=flat-square)](https://npmjs.com/package/vbuild) [![Build Status](https://img.shields.io/circleci/project/egoist/vbuild/master.svg?style=flat-square)](https://circleci.com/gh/egoist/vbuild) [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat-square)](https://github.com/egoist/donate) [![twitter](https://img.shields.io/badge/twitter-@vbuildjs-1da1f2.svg?style=flat-square)](https://twitter.com/vbuildjs)

## tl;dr

```bash
vbuild whatever.js --dev
# it just works
```

Develop web apps with no build configuration until you need.

## Config file

All CLI options and advanced options can be set here:

```js
module.exports = (options, req) => ({
  port: 5000
  // Other options
})

// Note that you can directly export an object too:
// module.exports = {port: 5000}
```

By default it will load `vbuild.config.js` if it exists. To change the path, you can add `--config [path]` in CLI arguments. 

You can also use `.vbuildrc` or set `vbuild` property in `package.json` when you only need JSON for configurations. See [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) for all the supported config files.

[⬆ back to top](#app)

### Shorthand

To set different config for different mode, you may use `options.dev` like:

```js
module.exports = options => ({
  webpack(cfg) {
    if (options.dev) {}
    else {}
    return cfg
  }
})
```

To simplify this, we provide a shorthand to do this:

```js
module.exports = {
  production: {}, // used in `!options.dev`
  development: {} // used in `options.dev`
}
```

The `production` or `development` config will be assigned into base config using `lodash.merge`.

[⬆ back to top](#app)

### Arguments

#### options

CLI options.

[⬆ back to top](#app)

#### req

The `require` function but context directory is the path to `node_modules/vbuild/lib`, which means you can use it to load vbuild's dependencies, like `webpack`.

[⬆ back to top](#app)

### Babel

JS files and `script` tags in single-file components are transpiled by Babel. We only use one preset by default: [babel-preset-vue-app](https://github.com/egoist/babel-preset-vue-app).

vbuild will use `.babelrc` if it exists, you can also set `babelrc` option in config file to disable config file, check out [full reference](https://babeljs.io/docs/usage/api/#options) for `babel` option.

Feel free to use [babel-preset-react-app](https://github.com/facebookincubator/create-react-app/blob/master/packages/babel-preset-react-app) or [babel-preset-preact-app](https://github.com/developit/babel-preset-preact) and so on to work with other frameworks.

[⬆ back to top](#app)

#### Transpile modules

By default babel will only transpile files outside `node_modules` folder into ES5, but you may use some npm packages that are written in ES2015, then you can tell babel to transpile them as well:

```js
module.exports = {
  transpileModules: ['element-ready']
}
```

[⬆ back to top](#app)

### PostCSS

Standalone `.css` files and `style` tags in single-file components are transpiled by PostCSS, the only plugin we use by default is `autoprefixer`, and you can use `autoprefixer` option in config file to adjust it, here's the config with default value:

```js
module.exports = {
  autoprefixer: {
    browsers: ['ie > 8', 'last 4 versions']
  }
}
```

You can use PostCSS config file like `postcss.config.js` or whatever [postcss-load-config](https://github.com/michael-ciniawsky/postcss-load-config) supports. `postcss` option is also available in config file.

Note that we only add autoprefixer when you use an `Array` or `Object` as postcss option.

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

### Hot reloading

By default we add HMR client to `client` entry, you can change it by:

```js
module.exports = {
  hmrEntry: ['other-name']
}
```

[⬆ back to top](#app)

### Code splitting

We enabled code splitting for vendor code and app code by default in production mode, you can set `vendor` option to `false` to disable it. And by default all required modules in `node_modules` will be split.

[⬆ back to top](#app)

### Webpack

Mutate webpack config as you wish:

```js
module.exports = options => ({
  webpack(webpackConfig) {
    if (options.dev) {
      // Apply some changes to webpackConfig
    }
    return webpackConfig
  }
})
```

The value of `webpack` could also be a plain object, this way it will be merged into default webpack config using [webpack-merge](https://github.com/survivejs/webpack-merge).

[⬆ back to top](#app)

### Custom HTML output

Type: `Object` `Array` `boolean`

[html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin) options, use this option to customize generated `index.html`, default value:

```js
module.exports = {
  html: {
    // `pkg` indicates the data in `package.json`
    title: pkg.title || pkg.productionName || pkg.name,
    description: pkg.description,
    template: // defaults to $cwd/index.html if it exists, otherwise use built-in template
  }
}
```

Check out the [built-in template](https://github.com/egoist/vbuild/blob/master/lib/index.html) file we use. To disable generating html file, you can set `html` to `false`.

The options for html-webpack-plugin are available in template file as `htmlWebpackPlugin.options` and you can use `htmlWebpackPlugin.options.pkg` to access the data of `package.json`.

[⬆ back to top](#app)

### Custom output filename

Set custom filename for js css static files:

```js
module.exports = {
  filename: {
    js: 'index.js',
    css: 'style.css',
    static: 'static/[name].[ext]'  
  }
}
```

[⬆ back to top](#app)

### Clean dist files

The files inside dist folder will be removed before you run vbuild in production mode, because in most cases the output filename will contain `[hash]`, we need to remove old files to keep the directory clean.

However in some cases you don't need this, then you can disable it by:

```js
module.exports = {
  cleanDist: false
}
```

[⬆ back to top](#app)

### Extracting CSS

The `extract` option is `true` by default in production mode, however you can also set it manually to overrde:

```js
module.exports = {
  // always disable extracting css
  extract: false
}
```

[⬆ back to top](#app)

### Copy static files

By default, all files inside `./static` folder will be copied to dist folder, you can set it to `false` to disable this.

If your want it to copy other folders, use an array instead:

```js
module.exports = {
  // copy ./public to ./dist/public
  copy: [{from: './public', to: './public'}]
}
```

See more options about this at [copy-webpack-plugin](https://github.com/kevlened/copy-webpack-plugin#pattern-properties).

[⬆ back to top](#app)

### Define constants at compile time

`define` is a short-hand to add webpack's [DefinePlugin](https://webpack.js.org/plugins/define-plugin/) for settings global constants which can be configured at compile time.

```js
module.exports = options => ({
  define: {
    __DEV__: JSON.stringify(options.dev)
  }
})
```

Then use it in your app code:

```js
if (__DEV__) {
  // perform something only in development mode a.k.a `--dev`
}
```

The default constant we add is `process.env.NODE_ENV`. The variables you defined here are only available in app code.

[⬆ back to top](#app)

### Define env variables

This is a shorthand for define a constant and set environment variable.

By default you will have `NODE_ENV` defined.

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

In template html file which uses [lodash.template](https://lodash.com/docs/4.17.4#template) syntax, you can write:

```html
<meta name="description" content="<%= process.env.APP_DESCRIPTION %>" />
```

The value of each env variable is automatically stringified and passed down to [webpack.DefinePlugin](https://webpack.js.org/plugins/define-plugin/).

In your app, similarly:

```js
const description = process.env.APP_DESCRIPTION
// do something
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
  setup(app) {
    app.get('/api', (req, res) => {
      res.end('This is the API')
    })
  }
}
```

[⬆ back to top](#app)

### Custom build process

Insead of letting vbuild run webpack as the build process, you can perform a custom one by using `run` function in config file:

```js
// For example, run tests with Karma
const Server = require('karma').Server

module.exports = {
  run(webpackConfig) {
    const server = new Server({
      webpack: webpackConfig,
      // ...Other karma options
    })
    server.start()
  }
}
```

[⬆ back to top](#app)
