'use strict'
const co = require('co')
const chalk = require('chalk')
const opn = require('opn')
const getIp = require('internal-ip')
const getStats = require('./get-stats')

module.exports = co.wrap(function * (webpackConfig, options) {
  const server = require('./server')

  const port = options.port
  const host = options.host
  const url = `http://${host === 'all' ? 'localhost' : host}:${port}`
  const stats = getStats(webpackConfig, options)
  const tip = chalk.dim(`To visit it on other device, connect it to the same network and open http://${getIp.v4()}:${port}`)
  console.log(
    chalk.cyan(`> ${options.title || 'vbuild'} is running at ${chalk.underline(url)}`) + '\n\n' + tip + '\n\n' + stats + '\n'
  )

  const app = server(webpackConfig, options) // eslint-disable-line no-unused-vars

  if (options.open) {
    yield opn(url)
  }
})
