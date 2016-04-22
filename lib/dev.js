'use strict'
const co = require('co')
const server = require('webpack-hot-server')
const boxen = require('boxen')
const chalk = require('chalk')
const opn = require('opn')
const _ = require('./utils')
const getMode = require('./get-mode')

module.exports = co.wrap(function* (webpackConfig, options) {
  const url = `http://localhost:${options.port}`
  const append = getMode(options)
  console.log(
    boxen(
      chalk.cyan(
        `${options.title || 'vbuild'} is running at ${url}${append}`
      ), {
        borderStyle: 'classic',
        padding: 1
      }
    )
  )
  
  yield server({
    config: webpackConfig,
    customIndex: _.cwd('dist'),
    port: options.port
  })
  
  if (!options.silent && !options.browserSync) {
    yield opn(url, {wait: false})
  }
})
