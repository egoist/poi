/* eslint-disable complexity */
'use strict'
const co = require('co')
const pify = require('pify')
const rm = require('rimraf')
const webpack = require('webpack')
const pathExists = require('path-exists')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const addons = require('./addons')
const getVueLoaders = require('./vue-loaders')
const _ = require('./utils')
const hmr = require('./hmr')
const defaultBabelOptions = require('./webpack/babel-options')
const CompilePlugin = require('./webpack/compile-plugin')

module.exports = co.wrap(function * (webpackConfig, options) {
  // clean the dist directory by default
  //  but you can disable it
  if (options.clean !== false && !options.dev) {
    yield pify(rm)(_.cwd(options.dist))
  }

  if (typeof options.entry === 'string') {
    webpackConfig.entry.client = [options.entry]
  } else if (typeof options.entry === 'object') {
    webpackConfig.entry = options.entry
  }

  const isLibrary = options.umd || options.cjs

  if (
    !options.dev &&
    options.vendor &&
    !isLibrary
  ) {
    webpackConfig.entry.vendor = options.vendor
    webpackConfig.plugins.push(
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest']
      })
    )
  }

  if (options.replace) {
    webpackConfig.plugins.push(
      new webpack.DefinePlugin(options.replace)
    )
  }

  if (options.notify !== false) {
    const WebpackNotifierPlugin = require('webpack-notifier')

    webpackConfig.plugins.push(
      new WebpackNotifierPlugin({
        alwaysNotify: true,
        title: options.title || 'vbuild'
      })
    )
  }

  if (options.externals) {
    webpackConfig.plugins.push(
      new webpack.ExternalsPlugin('commonjs2', options.externals)
    )
  }

  // control hot reloading and electron
  hmr(webpackConfig, options)

  if (_.isYarn()) {
    webpackConfig.resolve.modules.push(_.dir('../'))
    webpackConfig.resolveLoader.modules.push(_.dir('../'))
  }

  // html plugin
  // generate html for iife (web app) format
  // can be disabled via --disable-html
  if (
    (options.html !== false) &&
    !isLibrary &&
    !options.test
  ) {
    const htmlPlugin = require('./html-plugin')

    webpackConfig.plugins = webpackConfig.plugins.concat(htmlPlugin(options))
  }

  if (options.static) {
    const CopyWebpackPlugin = require('copy-webpack-plugin')

    if (Array.isArray(options.static)) {
      webpackConfig.plugins.push(
        new CopyWebpackPlugin(options.static)
      )
    } else if (options.static.from) {
      if (yield pathExists(_.cwd(options.static.from))) {
        webpackConfig.plugins.push(
          new CopyWebpackPlugin([options.static])
        )
      }
    }
  }

  // livereloading options
  if (options.live) {
    const LiveReloadPlugin = require('webpack-livereload-plugin')

    webpackConfig.plugins.push(new LiveReloadPlugin({
      appendScriptTag: true
    }))
  }

  // bundle format
  if (options.cjs) {
    webpackConfig.output.libraryTarget = 'commonjs2'
  } else if (typeof options.umd === 'string') {
    webpackConfig.output.libraryTarget = 'umd'
    webpackConfig.output.library = options.umd
  }

  if (options.electron) {
    webpackConfig.target = 'electron-renderer'
  } else {
    webpackConfig.target = options.target
  }

  const cssLoader = options.cssModules ?
    'css-loader?-autoprefixer&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader' :
    'css-loader?-autoprefixer!postcss-loader'
  // add css loader for .css files
  // with optional css modules
  webpackConfig.module.rules.push({
    test: /\.css$/,
    loader: options.dev ? `style-loader!${cssLoader}` : ExtractTextPlugin.extract({
      loader: cssLoader,
      fallbackLoader: 'style-loader'
    })
  })

  const defaultPostcssOptions = [
    require('autoprefixer')({
      browsers: ['last 4 versions', 'ie > 8']
    }),
    require('postcss-nested')()
  ]

  const postcssOptions = typeof options.postcss === 'function' ?
  options.postcss(defaultPostcssOptions) :
  defaultPostcssOptions

  const babelOptions = typeof options.babel === 'function' ?
    options.babel(defaultBabelOptions) :
    defaultBabelOptions

  const loaderOptions = {
    options: {
      context: _.cwd(),
      babel: babelOptions,
      postcss: postcssOptions,
      vue: {
        postcss: postcssOptions,
        loaders: getVueLoaders(options.dev && !options.extract),
        cssModules: {
          localIdentName: '[name]__[local]___[hash:base64:5]',
          camelCase: true
        }
      },
      fileLoader: {
        name: options.hash ? 'static/[name].[hash:8].[ext]' : 'static/[name].[ext]'
      }
    }
  }

  if (options.dev) {
    webpackConfig.performance = {hints: false}
  } else {
    const ProgressPlugin = require('webpack/lib/ProgressPlugin')

    webpackConfig.plugins.push(new ProgressPlugin())

    if (!isLibrary && options.hash !== false) {
      webpackConfig.output.filename = '[name].[chunkhash:8].js'
      webpackConfig.output.chunkFilename = '[id].[chunkhash:8].[name].js'
      webpackConfig.plugins.push(
        new ExtractTextPlugin('[name].[contenthash:8].css')
      )
    } else {
      webpackConfig.plugins.push(
        new ExtractTextPlugin('[name].css')
      )
    }

    // use if you put your website in a subdirectory
    // eg: /blog => http://domain.com/blog is your website
    if (options.publicPath) {
      webpackConfig.output.publicPath = options.publicPath
    }

    if (options.compress !== false) {
      webpackConfig.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
          sourceMap: true,
          compressor: {
            warnings: false
          },
          output: {
            comments: false
          }
        })
      )
    }
  }

  webpackConfig.plugins.push(new CompilePlugin(options))

  // dist directory of bundled files
  webpackConfig.output.path = _.cwd(`${options.dist}`)

  // devtool
  // set to false to disable devtool
  if (options.devtool !== undefined) {
    webpackConfig.devtool = options.devtool
  }

  // add alias
  if (options.alias) {
    webpackConfig.resolve.alias = options.alias
  }

  // add extra resolve paths
  // eg: to resolve modules in ./src folder
  // --resolve ./src
  // support array as well, --resolve ./src --resolve ./vendor
  // if no folder was specified
  // defaults to ./src
  if (options.resolve) {
    const resolve = options.resolve === true ? 'src' : options.resolve
    webpackConfig.resolve.modules = webpackConfig.resolve.modules.concat(resolve)
  }

  // by default your app is bundle into client.js or client.[hash].js
  // we can rename this by updating `client` to your custom filename
  if (options.filename) {
    webpackConfig.entry[options.filename] = webpackConfig.entry.client
    delete webpackConfig.entry.client
  }

  // apply options for loaders
  webpackConfig.plugins.push(
    new webpack.LoaderOptionsPlugin(loaderOptions)
  )

  // add addons, eslint et al
  addons(webpackConfig, options)

  return webpackConfig
})
