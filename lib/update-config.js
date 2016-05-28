'use strict'
const WebpackNotifierPlugin = require('webpack-notifier')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const deepAssign = require('deep-assign')
const trash = require('trash')
const co = require('co')
const AssetsPlugin = require('assets-webpack-plugin')
const LiveReloadPlugin = require('webpack-livereload-plugin')
const _ = require('./utils')
const electronify = require('./electronify')
const ProgressPlugin = require('./ProgressPlugin')
const htmlPlugin = require('./html-plugin')
const browersync = require('./browsersync')
const eslintRules = require('./eslint-rules')

module.exports = co.wrap(function* (webpackConfig, options) {
  yield trash([_.cwd(options.dist)])

  webpackConfig.entry = options.entry || webpackConfig.entry
  if (typeof webpackConfig.entry === 'object' && !Array.isArray(webpackConfig.entry)) {
    if (options.dev) {
      webpackConfig.output.filename = '[name].js'
    } else {
      webpackConfig.output.filename = '[name].[hash].js'
    }
  }

  webpackConfig.plugins.push(
    new WebpackNotifierPlugin({
      alwaysNotify: true,
      title: options.title || 'vbuild'
    })
  )
  // control hot reloading and electron
  electronify(webpackConfig, options)

  // html plugin
  // generate html for iife (web app) format
  // can be disabled via --disable-html
  if (!options.disableHtml && !options.cjs && !options.umd) {
    webpackConfig.plugins.push(htmlPlugin(options))
  }

  // assets-webpack-plugin
  if (options.outputAssetsPath) {
    const assetsFilename = typeof options.outputAssetsPath === 'string'
      ? options.outputAssetsPath
      : 'vbuild-assets.json'
    webpackConfig.plugins.push(new AssetsPlugin({
      filename: assetsFilename
    }))
  }

  // livereloading options
  if (options.live) {
    webpackConfig.plugins.push(new LiveReloadPlugin({
      appendScriptTag: true
    }))
  }

  // postcss plugins
  const defaultBrowsers = ['> 5%', 'last 2 version', 'ie > 8']
  webpackConfig.vue.postcss = [
    require('postcss-cssnext')({
      browsers: options.browsers || defaultBrowsers
    })
  ]
  // you can totally override it
  if (options.postcss) {
    webpackConfig.vue.postcss = options.postcss
  }
  // apply to css files too
  webpackConfig.postcss = webpackConfig.vue.postcss

  // eslint
  if (options.lint) {
    webpackConfig.vue.loaders.js = 'babel!eslint'
    webpackConfig.module.preLoaders.push({
      test: /\.js$/,
      loader: 'eslint-loader',
      exclude: /node_modules/
    })
    webpackConfig.eslint = deepAssign(eslintRules, options.eslint || {})
  }

  // bundle format
  if (options.cjs) {
    webpackConfig.output.libraryTarget = 'commonjs2'
  } else if (typeof options.umd === 'string') {
    webpackConfig.output.libraryTarget = 'umd'
    webpackConfig.output.library = options.umd
  }

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

  // bundle filename
  if (options.filename) {
    webpackConfig.output.filename = options.filename
  }

  // bundle dist directory
  webpackConfig.output.path = _.cwd(`${options.dist}/assets`)

  // devtool
  if (options.devtool !== undefined) {
    webpackConfig.devtool = options.devtool
  }

  // add alias
  if (options.alias) {
    const srcPath = typeof options.alias === 'string'
      ? options.alias
      : 'src'
    webpackConfig.resolve.alias = {
      src: _.cwd(srcPath),
      components: _.cwd(srcPath, 'components'),
      store: _.cwd(srcPath, 'vuex', 'store.js'),
      css: _.cwd(srcPath, 'css'),
      views: _.cwd(srcPath, 'views')
    }
  }

  if (typeof options.webpack === 'function') {
    options.webpack(webpackConfig, options)
  }

  return webpackConfig
})
