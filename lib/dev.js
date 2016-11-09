'use strict'
const co = require('co')
const chalk = require('chalk')
const opn = require('opn')
const getStats = require('./get-stats')

module.exports = co.wrap(function * (webpackConfig, options) {
  const server = require('./server')

  const port = options.port
  const host = options.host
  const url = `http://${host}:${port}`
  const stats = getStats(webpackConfig, options)
  console.log(
    chalk.cyan(`> ${options.title || 'vbuild'} is running at ${chalk.underline(url)}`) + '\n\n' + stats + '\n'
  )

  const app = server(webpackConfig, options)

  app.listen(port, host)

  if (options.open) {
    yield opn(url, {wait: false})
  }
})
