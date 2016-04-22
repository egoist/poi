'use strict'
const WebpackNotifierPlugin = require('webpack-notifier')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const electronify = require('./electronify')
const ProgressPlugin = require('./ProgressPlugin')
const htmlPlugin = require('./html-plugin')
const browersync = require('./browsersync')

module.exports = function (webpackConfig, options) {
  webpackConfig.entry = options.entry || webpackConfig.entry
  webpackConfig.plugins.push(
    new WebpackNotifierPlugin({
      alwaysNotify: true, 
      title: options.title || 'vbuild'
    })
  )
  // control hot reloading and electron
  electronify(webpackConfig, options)
  
  // html plugin
  webpackConfig.plugins.push(htmlPlugin(options))
  
  if (options.dev) {
    options.port = options.port || 4000
    browersync(webpackConfig, options)
  } else {
    webpackConfig.plugins.push(new ProgressPlugin())
    webpackConfig.vue.loaders.css = ExtractTextPlugin.extract(
      'vue-style-loader',
      'css-loader?sourceMap'
    )
  }
}
