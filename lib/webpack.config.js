'use strict'
const _ = require('./utils')

module.exports = {
  entry: ['./src/index.js'],
  output: {
    path: _.cwd('dist/assets/'),
    publicPath: '/assets/',
    filename: 'bundle.[hash].js',
    chunkFilename: '[id].[hash].bundle.js'
  },
  resolve: {
    extensions: ['', '.js', '.vue', '.css'],
    fallback: [
      _.cwd(),
      _.cwd('node_modules'),
      _.dir('node_modules')
    ]
  },
  resolveLoader: {
    modulesDirectories: [
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
        test: /\.hbs$/,
        loaders: ['handlebars']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url?limit=1000&name=images/[hash].[ext]',
        exclude: [/node_modules/]
      }
    ]
  },
  vue: {
    autoprefixer: false,
    loaders: {},
    postcss: [
      require('postcss-cssnext')()
    ]
  },
  babel: {
    presets: [require('babel-preset-es2015'), require('babel-preset-stage-0')],
    plugins: [require('babel-plugin-transform-runtime')]
  },
  plugins: []
}
