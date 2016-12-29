'use strict'
const webpack = require('webpack')
const FriendlyErrors = require('friendly-errors-webpack-plugin')
const config = require('./config')

config.devtool = 'eval-source-map'

config.plugins = config.plugins.concat([
  /*eslint-disable */
  new webpack.DefinePlugin({
    __DEV__: true,
    'process.env.NODE_ENV': JSON.stringify('development')
  }),
  /*eslint-enable */
  new FriendlyErrors()
])

module.exports = config
