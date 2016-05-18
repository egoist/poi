'use strict'
const Path = require('path')
const fs = require('fs-promise')
const co = require('co')
const exists = require('path-exists')
const babel = require('babel-core')
const requireFromString = require('require-from-string')
const deepAssign = require('deep-assign')
const build = require('./build')
const dev = require('./dev')
const _ = require('./utils')
const updateConfig = require('./update-config')

module.exports = co.wrap(function* (options) {
  options.port = options.port || 4000
  options.config = options.config === false
    ? false
    : Path.join(
      process.cwd(),
      typeof options.config === 'string'
        ? options.config
        : 'vbuild.js'
    )

  let fileConfig
  let devConfig
  let prodConfig
  if (options.config !== false ) {
    const hasConfig = yield exists(options.config)
    if (!hasConfig) {
      return
    }
    let code = yield fs.readFile(options.config, 'utf8')
    code = babel.transform(code, {
      presets: [require('babel-preset-es2015'), require('babel-preset-stage-0')]
    }).code

    fileConfig = requireFromString(code, {
      prependPaths: [_.dir('node_modules')]
    }).default

    devConfig = fileConfig.development
    prodConfig = fileConfig.production
    delete fileConfig.development
    delete fileConfig.production
  }

  const isDev = options.dev || options.watch
  deepAssign(
    options,
    fileConfig,
    isDev ? devConfig : prodConfig,
    isDev ? options.development : options.production
  )

  options.dist = options.dist || 'dist'

  // even in --watch mode we use webpack.config.prod
  // since it's simply rebuilding.
  let webpackConfig = options.dev
    ? require('./webpack.config.dev')
    : require('./webpack.config.prod')

  // update webpackConfig
  webpackConfig = yield updateConfig(webpackConfig, options)

  if (options.dev) {
    yield dev(webpackConfig, options)
  } else {
    yield build(webpackConfig, options)
  }
})
