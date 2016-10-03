'use strict'
const _ = require('./utils')

module.exports = function (config, options) {
  if (options.browserSync) {
    const BrowserSyncPlugin = require('browser-sync-webpack-plugin')

    const port = typeof options.browserSync === 'number' ? options.browserSync : 23789
    config.plugins.push(new BrowserSyncPlugin({
      proxy: `localhost:${options.port}`,
      files: [_.cwd(`${options.dist}/**/*`)],
      port
    }))
  }
}
