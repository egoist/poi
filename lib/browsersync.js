'use strict'
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const _ = require('./utils')

module.exports = function (config, options) {
  if (options.browserSync) {
    const port = typeof options.browserSync === 'number' ? options.browserSync : 23789
    config.plugins.push(new BrowserSyncPlugin({
      proxy: `localhost:${options.port}`,
      files: [_.cwd(`${options.dist}/**/*`)],
      port
    }))
  }
}
