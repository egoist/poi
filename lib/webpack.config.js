'use strict'
const _ = require('./utils')

module.exports = {
  entry: ['./src/index.js'],
  output: {
    path: _.cwd('dist/assets'),
    publicPath: '/assets/',
    filename: 'bundle.[hash].js'
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
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url?limit=1000&name=images/[hash].[ext]'
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'url?limit=1000&name=fonts/[hash].[ext]'
      },
      {
        test: /\.json$/,
        loaders: ['json']
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader'
      }
    ]
  },
  vue: {
    autoprefixer: false,
    loaders: {}
  },
  babel: {
    presets: [require('babel-preset-es2015'), require('babel-preset-stage-0')],
    plugins: [require('babel-plugin-transform-runtime')]
  },
  plugins: []
}
