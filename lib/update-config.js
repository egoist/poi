/* eslint-disable complexity */
'use strict'
const trash = require('trash')
const co = require('co')
const webpack = require('webpack')
const pathExists = require('path-exists')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const addons = require('./addons')
const getCSSLoader = require('./css-loader')
const _ = require('./utils')
const hmr = require('./hmr')

module.exports = co.wrap(function * (webpackConfig, options) {
  // clean the dist directory by default
  //  but you can disable it
  if (options.clean !== false) {
    yield trash([_.cwd(options.dist)])
  }

  if (typeof options.entry === 'string') {
    webpackConfig.entry.client = [options.entry]
  } else if (typeof options.entry === 'object') {
    webpackConfig.entry = options.entry
  }

  if (
    !options.dev &&
    options.vendor &&
    !options.umd &&
    !options.cjs
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
    !options.disableHtml &&
    !options.cjs &&
    !options.umd &&
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

    // postcss plugins
  let postcssOptions = options.postcss || {}

  if (_.isType(postcssOptions, 'Object')) {
    let postcssPlugins = [
      require('autoprefixer')(Object.assign({
        browsers: ['last 4 versions', 'ie > 8']
      }, postcssOptions.autoprefixer)),
      require('postcss-nested')(postcssOptions['postcss-nested'])
    ]

    if (Array.isArray(postcssOptions.use)) {
      const plugins = postcssOptions.use.map(name => {
        const plugin = require(_.cwd('node_modules', name))
        return plugin(postcssOptions[name])
      })
      postcssPlugins = postcssOptions.append === false ?
        plugins :
        postcssPlugins.concat(plugins)
    }

    postcssOptions = () => ({
      plugins: postcssPlugins,
      parser: postcssOptions.parser
    })
  }

  const loaderOptions = {
    options: {
      context: _.cwd(),
      babel: options.babel,
      postcss: postcssOptions,
      vue: {
        postcss: postcssOptions,
        loaders: getCSSLoader(options.dev),
        cssModules: {
          localIdentName: '[name]__[local]___[hash:base64:5]',
          camelCase: true
        }
      }
    }
  }



  if (!options.dev) {
    const ProgressPlugin = require('webpack/lib/ProgressPlugin')

    webpackConfig.plugins.push(new ProgressPlugin())

    if (!options.cjs && !options.umd) {
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
