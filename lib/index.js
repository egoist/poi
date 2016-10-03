'use strict'
const Path = require('path')
const co = require('co')
const exists = require('path-exists')
const merge = require('lodash.merge')
const build = require('./build')
const dev = require('./dev')
const updateConfig = require('./update-config')

module.exports = co.wrap(function * (options) {
  options.port = options.port || 4000
  options.config = options.config === false
    ? false
    : Path.resolve(
        typeof options.config === 'string'
          ? options.config
          : 'vue.config.json'
      )

  let fileConfig
  let devConfig
  let prodConfig
  if (options.config !== false) {
    const hasConfig = yield exists(options.config)
    if (hasConfig) {
      fileConfig = require(Path.resolve(options.config))

      devConfig = fileConfig.development
      prodConfig = fileConfig.production
      delete fileConfig.development
      delete fileConfig.production
    }
  }

  const isDev = options.dev || options.watch

  process.env.NODE_ENV = isDev ? 'development' : 'production'

  merge(
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
