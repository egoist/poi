'use strict'
const webpack = require('webpack')
const config = require('./webpack.config')
const htmlPlugin = require('./html-plugin')

config.devtool = 'cheap-module-eval-source-map'

config.plugins = config.plugins.concat([
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin({
    __DEV__: true,
    'process.env': JSON.stringify('development')
  })
])

module.exports = config
