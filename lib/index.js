'use strict'
const Path = require('path')
const co = require('co')
const merge = require('lodash.merge')
const build = require('./build')
const dev = require('./dev')
const updateConfig = require('./update-config')

module.exports = co.wrap(function * (options) {
  options.config = options.config === false
    ? false
    : Path.resolve(
        typeof options.config === 'string'
          ? options.config
          : 'vue.config'
      )

  let fileConfig
  let devConfig
  let prodConfig
  if (options.config !== false) {
    try {
      options.config = require.resolve(options.config)
      fileConfig = require(options.config)
    } catch (err) {}

    if (fileConfig) {
      devConfig = fileConfig.development
      prodConfig = fileConfig.production
      delete fileConfig.development
      delete fileConfig.production
    }
  }

  const isDev = options.dev || options.watch

  process.env.NODE_ENV = isDev ? 'development' : 'production'

  const buildOptions = merge(
    {port: 4000},
    fileConfig,
    isDev ? devConfig : prodConfig,
    options
  )

  buildOptions.dist = buildOptions.dist || 'dist'

  // even in --watch mode we use webpack.config.prod
  // since it's simply rebuilding.
  let webpackConfig = buildOptions.dev
    ? require('./webpack.config.dev')
    : require('./webpack.config.prod')

  // update webpackConfig
  webpackConfig = yield updateConfig(webpackConfig, buildOptions)

  if (buildOptions.dev) {
    yield dev(webpackConfig, buildOptions)
  } else {
    yield build(webpackConfig, buildOptions)
  }
})
