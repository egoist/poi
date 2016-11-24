'use strict'

module.exports = (config, options) => {
  if (options.eslint) {
    config.module.rules.push({
      test: /\.(vue|js)$/,
      enforce: 'pre',
      loader: 'eslint-loader',
      exclude: [/node_modules/],
      options: Object.assign({
        configFile: require.resolve('eslint-config-vue')
      }, options.eslint)
    })
  }

  if (options.gzip) {
    const CompressionPlugin = require('compression-webpack-plugin')

    config.plugins.push(new CompressionPlugin(
      typeof options.gzip === 'object' ?
      options.gzip :
      {}
    ))
  }

  if (options.test) {
    config.devtool = 'inline-source-map'
    delete config.entry
  }
}
