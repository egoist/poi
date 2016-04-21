'use strict'
const webpack = require('webpack')
const trash = require('trash')
const co = require('co')
const chalk = require('chalk')
const pify = require('pify')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const boxen = require('boxen')
const ProgressPlugin = require('./ProgressPlugin')
const _ = require('./utils')
const htmlPlugin = require('./html-plugin')
const electronify = require('./electronify')

module.exports = co.wrap(function* (webpackConfig, options) {
  yield trash([_.cwd('dist')])

  // control hot reloading and electron
  electronify(webpackConfig, options)

  webpackConfig.plugins.push(
    new ProgressPlugin(),
    htmlPlugin(options)
  )

  webpackConfig.vue.loaders.css = ExtractTextPlugin.extract('vue-style-loader', 'css-loader?sourceMap')

  const append = options.electron ? chalk.gray(' (Electron mode)') : ''
  console.log(
    boxen(
      chalk.cyan(`Building ${options.title || 'app'} for you`) + append,
      {
        borderStyle: 'classic',
        padding: 1
      }
    )
  )

  if (typeof options.webpack === 'function') {
    options.webpack(webpackConfig, options)
  }

  const stats = yield pify(webpack)(webpackConfig)
  console.log(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }))
})
