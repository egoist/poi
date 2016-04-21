'use strict'
const Path = require('path')
const fs = require('fs-promise')
const co = require('co')
const exists = require('path-exists')
const chalk = require('chalk')
const babel = require('babel-core')
const requireFromString = require('require-from-string')
const deepAssign = require('deep-assign')
const build = require('./build')
const dev = require('./dev')
const _ = require('./utils')

module.exports = co.wrap(function* (options) {
  const configFile = Path.join(process.cwd(), options.config || 'vbuild.js')

  let mergedOptions = options
  if (yield exists(configFile)) {
    let code = yield fs.readFile(configFile, 'utf8')
    code = babel.transform(code, {
      presets: [require('babel-preset-es2015'), require('babel-preset-stage-0')]
    }).code

    mergedOptions = requireFromString(code, {
      prependPaths: [_.dir('node_modules')]
    })
    mergedOptions = deepAssign({}, mergedOptions.default, options)
  }

  const webpackConfig = options.dev
    ? require('./webpack.config.dev')
    : require('./webpack.config.prod')

  /**
   * Update webpackConfig
   */
  webpackConfig.entry = mergedOptions.entry || webpackConfig.entry

  if (options.dev) {
    yield dev(webpackConfig, mergedOptions)
  } else {
    yield build(webpackConfig, mergedOptions)
  }
})
