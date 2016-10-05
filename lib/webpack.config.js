'use strict'
const _ = require('./utils')

module.exports = {
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
    preLoaders: [],
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
        test: /\.hbs$/,
        loaders: ['handlebars']
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
    loaders: {}
  },
  plugins: []
}
