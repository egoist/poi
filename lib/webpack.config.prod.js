'use strict'
const webpack = require('webpack')
const config = require('./webpack.config')

config.devtool = 'source-map'
config.output.publicPath = './'

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
