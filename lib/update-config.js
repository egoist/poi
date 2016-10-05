/* eslint-disable complexity */
'use strict'
const merge = require('lodash.merge')
const trash = require('trash')
const co = require('co')
const _ = require('./utils')
const electronify = require('./electronify')
const browersync = require('./browsersync')
const eslintRules = require('./eslint-rules')

module.exports = co.wrap(function * (webpackConfig, options) {
  const webpack = require('webpack')
  const ExtractTextPlugin = require('extract-text-webpack-plugin')

  yield trash([_.cwd(options.dist)])

  if (options.entry) {
    webpackConfig.entry.client = [options.entry]
  }

  if (options.vendor !== false) {
    webpackConfig.entry.vendor = options.vendor || ['vue']
    webpackConfig.plugins.push(
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest']
      })
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
  electronify(webpackConfig, options)

  // html plugin
  // generate html for iife (web app) format
  // can be disabled via --disable-html
  if (!options.disableHtml && !options.cjs && !options.umd) {
    const htmlPlugin = require('./html-plugin')

    webpackConfig.plugins.push(htmlPlugin(options))
  }

  if (options.gzip) {
    const CompressionPlugin = require('compression-webpack-plugin')

    webpackConfig.plugins.push(new CompressionPlugin(options.gzip))
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

  let postcssPlugins = [
    require('autoprefixer')(Object.assign({
      browsers: ['> 5%', 'last 2 version', 'ie > 8']
    }, postcssOptions.autoprefixer)),
    require('postcss-nested')(postcssOptions['postcss-nested'])
  ]

  if (Array.isArray(postcssOptions.use)) {
    const plugins = postcssOptions.use.map(name => {
      const plugin = require(_.cwd(name))
      return plugin(postcssOptions[name])
    })
    postcssPlugins = postcssOptions.append === false
      ? plugins
      : postcssPlugins.concat(plugins)
  }

  if (typeof postcssOptions.use === 'function') {
    webpackConfig.postcss = postcssOptions.use
  } else {
    webpackConfig.postcss = () => ({
      plugins: postcssPlugins,
      parser: postcssOptions.parser
    })
  }

  // apply to vue files too
  webpackConfig.vue.postcss = webpackConfig.postcss

  // babel options
  webpackConfig.babel = Object.assign({
    presets: [
      [
        require.resolve('babel-preset-es2015'),
        {modules: false}
      ],
      require.resolve('babel-preset-stage-2')
    ],
    plugins: [
      require.resolve('babel-plugin-transform-runtime'),
      require.resolve('babel-plugin-transform-vue-jsx')
    ]
  }, options.babel)

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

  const cssLoader = options.cssModules
    ? 'css-loader?-autoprefixer&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader'
    : 'css-loader?-autoprefixer!postcss-loader'
  // add css loader for .css files
  // with optional css modules
  webpackConfig.module.loaders.push({
    test: /\.css$/,
    loader: options.dev ? `style-loader!${cssLoader}` : ExtractTextPlugin.extract({
      loader: cssLoader,
      fallbackLoader: 'style-loader'
    })
  })


  if (options.dev) {
    options.port = options.port || 4000
    browersync(webpackConfig, options)
  } else {
    const ProgressPlugin = require('./ProgressPlugin')

    webpackConfig.plugins.push(new ProgressPlugin())
    webpackConfig.vue.loaders.css = ExtractTextPlugin.extract({
      fallbackLoader: 'vue-style-loader',
      loader: 'css-loader?sourceMap&-autoprefixer'
    })

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

  if (options.filename) {
    webpackConfig.entry[options.filename] = webpackConfig.entry.client
    delete webpackConfig.entry.client

  }

  return webpackConfig
})
