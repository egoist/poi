'use strict'
const webpack = require('webpack')
const trash = require('trash')
const co = require('co')
const chalk = require('chalk')
const pify = require('pify')
const boxen = require('boxen')
const _ = require('./utils')

module.exports = co.wrap(function* (webpackConfig, options) {
  yield trash([_.cwd('dist')])

  const append = options.electron ? chalk.gray(' (Electron mode)') : ''
  console.log(
    boxen(
      chalk.cyan(`Building ${options.title || 'app'} for you`) + append,
      {
        borderStyle: 'classic',
        padding: 1
      }
    )
  )

  if (typeof options.webpack === 'function') {
    options.webpack(webpackConfig, options)
  }

  const stats = yield pify(webpack)(webpackConfig)
  console.log(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }))
})
