'use strict'
const webpackTargetElectronRenderer = require('webpack-target-electron-renderer')
const _ = require('./utils')

module.exports = function (config, options) {
  if (options.electron) {
    config.target = webpackTargetElectronRenderer(config)
  }
  if (options.dev) {
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
}
