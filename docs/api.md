## JavaScript API

You can use vbuild as a Node.js module:

```js
const vbuild = require('vbuild')

const config = require('./vbuild.config')
const result = vbuild(config)
//=> res:
{
  webpackConfig, // final webpack config
  options, // final options (merged config with default values)
  compiler, // webpack compiler instance
  watcher, // in watch mode, webpack watcher
  server, // in dev mode, an instance of `http.Server` without calling `.listen`
  devMiddleware // in dev mode, the webpack-dev-middleware instance
}

// get webpack config and merged options only
const result = vbuild.getConfig(config)
//=> res:
{
  webpackConfig,
  options
}

// error catch
function handleError(err) {
  if (err.name === 'AppError') {
    // error occurs in starting the compilation
  } else {
    // other unknown error
  }
}

try {
  vbuild(config)
} catch (err) {
  handleError(err)
}
```
