'use strict'
const webpack = require('webpack')
const config = require('./config')

config.devtool = 'eval-source-map'

config.plugins = config.plugins.concat([
  /*eslint-disable */
  new webpack.DefinePlugin({
    __DEV__: true,
    'process.env.NODE_ENV': JSON.stringify('development')
  })
  /*eslint-enable */
])

module.exports = config
