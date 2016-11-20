'use strict'
const co = require('co')
const chalk = require('chalk')
const pify = require('pify')
const log = require('fancy-log')
const getStats = require('./get-stats')

module.exports = co.wrap(function * (webpackConfig, options) {
  const webpack = require('webpack')

  const stats = getStats(webpackConfig, options)
  console.log(
    chalk.cyan(`> Building ${options.title || 'app'} for you`) + '\n\n' + stats + '\n'
  )

  if (options.watch) {
    let count = 0
    const compiler = webpack(webpackConfig)
    compiler.watch({
      aggregateTimeout: 300
    }, () => {
      log(`The app has been built for ${++count} time${moreThanOne(count)}`)
    })
  } else {
    yield pify(webpack)(webpackConfig)
  }

  function moreThanOne(number) {
    return number > 1 ? 's' : ''
  }
})
