'use strict'
const _ = require('./utils')

module.exports = function (config, options) {
  if (options.electron) {
    config.target = 'electron-renderer'
  }
  if (options.dev) {
    if (!options.live) {
      let pathToHotMiddleware

      if (_.isYarn()) {
        pathToHotMiddleware = _.dir('../webpack-hot-middleware/client')
      } else {
        pathToHotMiddleware = _.dir('node_modules/webpack-hot-middleware/client')
      }

      const hmrClient = options.electron ?
        `${pathToHotMiddleware}?path=http://localhost:${options.port}/__webpack_hmr` :
        pathToHotMiddleware
      config.entry.client.push(hmrClient)
    }
    config.output.publicPath = `http://localhost:${options.port}${config.output.publicPath}`
  }
}
