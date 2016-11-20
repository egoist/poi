'use strict'
const _ = require('../utils')
const DisplayStats = require('./plugins/display-stats')

module.exports = {
  entry: {
    client: ['./src/index.js']
  },
  output: {
    path: _.cwd('dist'),
    publicPath: '/',
    filename: 'assets/[name].js',
    chunkFilename: 'assets/[id].[name].js'
  },
  resolve: {
    extensions: ['', '.js', '.vue', '.css'],
    modules: [
      _.cwd(),
      _.cwd('node_modules'),
      _.dir('node_modules')
    ]
  },
  resolveLoader: {
    modules: [
      _.cwd('node_modules'),
      _.dir('node_modules')
    ]
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        exclude: [/node_modules/]
      },
      {
        test: /\.vue$/,
        loaders: ['vue']
      },
      {
        test: /\.(ico|jpg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        loader: 'file',
        query: {
          name: 'static/media/[name].[hash:8].[ext]'
        }
      },
      {
        test: /\.json$/,
        loaders: ['json']
      }
      // css loader will be added in ./update-config.js
    ]
  },
  vue: {
    loaders: {},
    cssModules: {
      localIdentName: '[name]__[local]___[hash:base64:5]',
      camelCase: true
    }
  },
  plugins: [
    new DisplayStats()
  ]
}
