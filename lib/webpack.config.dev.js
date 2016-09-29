'use strict'
const webpack = require('webpack')
const config = require('./webpack.config')

config.devtool = 'eval-source-map'

config.output.filename = 'bundle.js'

config.plugins = config.plugins.concat([
  new webpack.NoErrorsPlugin(),
  /*eslint-disable */
  new webpack.DefinePlugin({
    __DEV__: true,
    'process.env.NODE_ENV': JSON.stringify('development')
  })
  /*eslint-enable */
])

module.exports = config
