'use strict'
const co = require('co')
const chalk = require('chalk')
const opn = require('opn')
const _ = require('./utils')
const getStats = require('./get-stats')

module.exports = co.wrap(function * (webpackConfig, options) {
  const webpack = require('webpack')
  const Server = require('webpack-dev-server')

  const port = options.port
  const host = options.host
  const url = `http://${host}:${port}`
  const stats = getStats(webpackConfig, options)
  console.log(
    chalk.cyan(`> ${options.title || 'vbuild'} is running at ${chalk.underline(url)}`) + '\n\n' + stats + '\n'
  )

  const app = new Server(webpack(webpackConfig), Object.assign({
    hot: !options.live,
    stats: {
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    },
    historyApiFallback: true,
    publicPath: webpackConfig.output.publicPath
  }, options.devServer))

  app.listen(port, host)

  if (options.open) {
    yield opn(url, {wait: false})
  }
})
