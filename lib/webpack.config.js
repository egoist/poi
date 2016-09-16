'use strict'
const _ = require('./utils')

module.exports = {
  entry: ['./src/index.js'],
  output: {
    path: _.cwd('dist'),
    publicPath: '/',
    filename: 'bundle.[hash].js'
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
      },
      // css loader will be added in ./update-config.js
    ]
  },
  vue: {
    loaders: {}
  },
  babel: {
    presets: [
      [
        require.resolve('babel-preset-es2015'),
        {modules: false}
      ],
      require.resolve('babel-preset-stage-0')
    ],
    plugins: [
      require.resolve('babel-plugin-transform-runtime'),
      require.resolve('babel-plugin-transform-vue-jsx')
    ]
  },
  plugins: []
}
