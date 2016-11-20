'use strict'
const webpack = require('webpack')
const config = require('./config')

config.devtool = 'source-map'

config.plugins = config.plugins.concat([
  /*eslint-disable */
  new webpack.DefinePlugin({
    '__DEV__': false,
    'process.env.NODE_ENV': JSON.stringify('production')
  }),
  /*eslint-enable */
  new webpack.LoaderOptionsPlugin({
    minimize: true
  })
])

module.exports = config
