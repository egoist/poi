'use strict'
const _ = require('./utils')

module.exports = function (config, options) {
  if (options.electron) {
    config.target = 'electron-renderer'
  }
  if (options.dev) {
    if (!options.live) {
      const hmrClient = options.electron
        ? _.dir(`node_modules/webpack-hot-middleware/client?path=http://localhost:${options.port}/__webpack_hmr`)
        : _.dir('node_modules/webpack-hot-middleware/client')
      if (typeof config.entry === 'string') {
        config.entry = [config.entry, hmrClient]
      } else if (Array.isArray(config.entry)) {
        config.entry.push(hmrClient)
      } else {
        config.entry.hmrClient = hmrClient
      }
    }
    config.output.publicPath = `http://localhost:${options.port}${config.output.publicPath}`
  }
}
