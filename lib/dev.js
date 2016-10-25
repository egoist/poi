'use strict'
const co = require('co')
const chalk = require('chalk')
const opn = require('opn')
const _ = require('./utils')
const getStats = require('./get-stats')

module.exports = co.wrap(function * (webpackConfig, options) {
  const webpack = require('webpack')
  const server = require('webpack-hot-server')

  const port = options.port
  const url = `http://localhost:${port}`
  const stats = getStats(webpackConfig, options)
  console.log(
    chalk.cyan(`> ${options.title || 'vbuild'} is running at ${chalk.underline(url)}`) + '\n\n' + stats + '\n'
  )

  const app = server({
    webpack,
    hot: !options.live,
    config: webpackConfig,
    customIndex: options.disableHtml ? false : _.cwd(options.dist),
    wrap: options.wrap
  })

  app.listen(port)

  if (options.open) {
    yield opn(url, {wait: false})
  }
})
