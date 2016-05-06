'use strict'
const co = require('co')
const server = require('webpack-hot-server')
const boxen = require('boxen')
const chalk = require('chalk')
const opn = require('opn')
const _ = require('./utils')
const getMode = require('./get-mode')

module.exports = co.wrap(function* (webpackConfig, options) {
  const port = options.port
  const url = `http://localhost:${port}`
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

  const app = server({
    config: webpackConfig,
    customIndex: options.disableHtml ? false : _.cwd(options.dist),
    wrap: options.wrap
  })

  app.listen(port)

  if (!options.silent && !options.browserSync) {
    yield opn(url, {wait: false})
  }
})
