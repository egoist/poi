/* eslint-disable complexity */
'use strict'
const WebpackNotifierPlugin = require('webpack-notifier')
const merge = require('lodash.merge')
const trash = require('trash')
const co = require('co')
const _ = require('./utils')
const electronify = require('./electronify')
const browersync = require('./browsersync')
const eslintRules = require('./eslint-rules')

module.exports = co.wrap(function * (webpackConfig, options) {
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
    const htmlPlugin = require('./html-plugin')

    webpackConfig.plugins.push(htmlPlugin(options))
  }

  // assets-webpack-plugin
  if (options.outputAssetsPath) {
    const AssetsPlugin = require('assets-webpack-plugin')

    const assetsFilename = typeof options.outputAssetsPath === 'string'
      ? options.outputAssetsPath
      : 'vbuild-assets.json'
    webpackConfig.plugins.push(new AssetsPlugin({
      filename: assetsFilename
    }))
  }

  // livereloading options
  if (options.live) {
    const LiveReloadPlugin = require('webpack-livereload-plugin')

    webpackConfig.plugins.push(new LiveReloadPlugin({
      appendScriptTag: true
    }))
  }

  // postcss plugins
  const postcssOptions = options.postcss || {}

  webpackConfig.vue.postcss = [
    require('autoprefixer')(Object.assign({
      browsers: ['> 5%', 'last 2 version', 'ie > 8']
    }, postcssOptions.autoprefixer)),
    require('postcss-nested')(postcssOptions['postcss-nested'])
  ]

  if (postcssOptions.use) {
    if (typeof postcssOptions.use === 'function') {
      webpackConfig.vue.postcss = postcssOptions.use
    } else {
      const plugins = postcssOptions.use.map(name => {
        const plugin = require(_.cwd(plugin))
        return plugin(postcssOptions[name])
      })
      webpackConfig.vue.postcss = postcssOptions.append === false ?
        plugins :
        webpackConfig.vue.postcss.concat(plugins)
    }
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
    webpackConfig.eslint = merge(eslintRules, options.eslint || {})
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
    const ExtractTextPlugin = require('extract-text-webpack-plugin')
    const ProgressPlugin = require('./ProgressPlugin')

    webpackConfig.plugins.push(new ProgressPlugin())
    webpackConfig.vue.loaders.css = ExtractTextPlugin.extract({
      fallbackLoader: 'vue-style-loader',
      loader: 'css-loader?sourceMap&-autoprefixer'
    })
  }

  // add css loader
  // with optional css modules
  const cssLoader = options.cssModules
    ? 'style-loader!css-loader?-autoprefixer&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader'
    : 'style-loader!css-loader?-autoprefixer!postcss-loader'
  webpackConfig.module.loaders.push({
    test: /\.css$/,
    loader: cssLoader
  })

  // bundle filename
  if (options.filename) {
    webpackConfig.output.filename = options.filename
  }

  // bundle dist directory
  webpackConfig.output.path = _.cwd(`${options.dist}`)

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

  return webpackConfig
})
