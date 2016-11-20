'use strict'
const co = require('co')
const chalk = require('chalk')
const pify = require('pify')
const getStats = require('./get-stats')

module.exports = co.wrap(function * (webpackConfig, options) {
  const webpack = require('webpack')

  const stats = getStats(webpackConfig, options)
  console.log(
    chalk.cyan(`> Building ${options.title || 'app'} for you`) + '\n\n' + stats + '\n'
  )

  if (options.watch) {
    const compiler = webpack(webpackConfig)
    compiler.watch({
      aggregateTimeout: 300
    }, () => null)
  } else {
    yield pify(webpack)(webpackConfig)
  }
})
