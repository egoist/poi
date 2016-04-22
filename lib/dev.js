'use strict'
const co = require('co')
const server = require('webpack-hot-server')
const boxen = require('boxen')
const chalk = require('chalk')
const opn = require('opn')
const _ = require('./utils')

module.exports = co.wrap(function* (webpackConfig, options) {
  yield server({
    config: webpackConfig,
    customIndex: _.cwd('dist'),
    port: options.port
  })
  const append = options.electron ? chalk.gray(' (Electron mode)') : ''
  const url = `http://localhost:${options.port}${append}`
  console.log(
    boxen(
      chalk.cyan(
        `${options.title || 'vbuild'} is running at ${url}`
      ), {
        borderStyle: 'classic',
        padding: 1
      }
    )
  )
  if (!options.silent && !options.browserSync) {
    opn(url)
  }
})
