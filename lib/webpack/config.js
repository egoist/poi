'use strict'
const _ = require('../utils')
const DisplayStats = require('./plugins/display-stats')

module.exports = {
  context: _.cwd(),
  entry: {
    client: ['./src/index.js']
  },
  output: {
    path: _.cwd('dist'),
    publicPath: '/',
    filename: '[name].js',
    chunkFilename: '[id].[name].js'
  },
  resolve: {
    extensions: ['.js', '.vue', '.css'],
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
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: [/node_modules/]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.(ico|jpg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          name: 'static/media/[name].[hash:8].[ext]'
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
      // css loader will be added in ./update-config.js
    ]
  },
  plugins: [
    new DisplayStats()
  ]
}
