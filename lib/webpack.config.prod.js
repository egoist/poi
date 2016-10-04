'use strict'
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const config = require('./webpack.config')

config.devtool = 'source-map'
config.output.publicPath = './'
config.output.filename = '[name].[chunkhash:8].js'
config.output.chunkFilename = '[id].[chunkhash:8].[name].js'

config.plugins = config.plugins.concat([
  /*eslint-disable */
  new webpack.DefinePlugin({
    '__DEV__': false,
    'process.env.NODE_ENV': JSON.stringify('production')
  }),
  /*eslint-enable */
  new webpack.LoaderOptionsPlugin({
    minimize: true
  }),
  new webpack.optimize.UglifyJsPlugin({
    sourceMap: true,
    compressor: {
      warnings: false
    },
    output: {
      comments: false
    }
  }),
  new ExtractTextPlugin('[name].[contenthash:8].css')
])

module.exports = config
