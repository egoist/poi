'use strict'
const webpack = require('webpack')
const co = require('co')
const chalk = require('chalk')
const pify = require('pify')
const boxen = require('boxen')
const log = require('fancy-log')
const getMode = require('./get-mode')

module.exports = co.wrap(function* (webpackConfig, options) {
  const append = getMode(options)
  console.log(
    boxen(
      chalk.cyan(`Building ${options.title || 'app'} for you`) + append,
      {
        borderStyle: 'classic',
        padding: 1
      }
    )
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
