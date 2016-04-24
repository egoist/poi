'use strict'
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const config = require('./webpack.config')

config.devtool = 'source-map'
config.output.publicPath = './assets/'

config.plugins = config.plugins.concat([
  new webpack.optimize.OccurenceOrderPlugin(),
  /*eslint-disable */
  new webpack.DefinePlugin({
    '__DEV__': false,
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  }),
  /*eslint-enable */
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      warnings: false
    },
    comments: false
  }),
  new ExtractTextPlugin('[name].[contenthash].css')
])

module.exports = config
