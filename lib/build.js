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
    }, (err, stats) => {
      log(`The app has been built for ${++count} time${moreThanOne(count)}`)
      if (err) {
        console.log(err)
        return
      }
      logStats(stats)
    })
  } else {
    const stats = yield pify(webpack)(webpackConfig)
    if (stats.hasErrors()) {
      process.exitCode = 1
    }
    logStats(stats)
  }

  function logStats(stats) {
    console.log(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }))
  }

  function moreThanOne(number) {
    return number > 1 ? 's' : ''
  }
})
