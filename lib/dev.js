'use strict'
const co = require('co')
const webpack = require('webpack')
const server = require('webpack-hot-server')
const boxen = require('boxen')
const chalk = require('chalk')
const opn = require('opn')
const _ = require('./utils')
const getStats = require('./get-stats')

module.exports = co.wrap(function* (webpackConfig, options) {
  const port = options.port
  const url = `http://localhost:${port}`
  const stats = getStats(webpackConfig, options)
  console.log(
    boxen(
      chalk.cyan(`${options.title || 'vbuild'} is running at ${chalk.underline(url)}`) + '\n\n' + stats, {
        borderStyle: 'classic',
        padding: 1
      }
    )
  )

  const app = server({
    webpack,
    hot: true,
    config: webpackConfig,
    customIndex: options.disableHtml ? false : _.cwd(options.dist),
    wrap: options.wrap
  })

  app.listen(port)

  if (!options.silent && !options.browserSync) {
    yield opn(url, {wait: false})
  }
})
