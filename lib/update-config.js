'use strict'
const WebpackNotifierPlugin = require('webpack-notifier')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const deepAssign = require('deep-assign')
const trash = require('trash')
const co = require('co')
const _ = require('./utils')
const electronify = require('./electronify')
const ProgressPlugin = require('./ProgressPlugin')
const htmlPlugin = require('./html-plugin')
const browersync = require('./browsersync')
const eslintRules = require('./eslint-rules')

module.exports = co.wrap(function* (webpackConfig, options) {
  yield trash([_.cwd('dist')])
  
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
  
  // postcss plugins
  const defaultBrowsers = ['> 5%', 'last 2 version', 'ie > 8']
  webpackConfig.vue.postcss = [
    require('postcss-cssnext')({
      browsers: options.browsers || defaultBrowsers
    })
  ]
  
  // eslint
  webpackConfig.eslint = deepAssign(eslintRules, options.eslint || {})
  
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
  
  if (typeof options.webpack === 'function') {
    options.webpack(webpackConfig, options)
  }
    
  return webpackConfig
})
