'use strict'
const co = require('co')
const server = require('webpack-hot-server')
const boxen = require('boxen')
const chalk = require('chalk')
const opn = require('opn')
const htmlPlugin = require('./html-plugin')
const _ = require('./utils')
const electronify = require('./electronify')
const browersync = require('./browsersync')

module.exports = co.wrap(function* (webpackConfig, options) {
  webpackConfig.plugins.push(htmlPlugin(options))

  options.port = options.port || 4000

  // control hot reloading and electron
  electronify(webpackConfig, options)
  browersync(webpackConfig, options)

  if (typeof options.webpack === 'function') {
    options.webpack(webpackConfig, options)
  }

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
