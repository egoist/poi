'use strict'
const Path = require('path')
const co = require('co')
const chalk = require('chalk')
const merge = require('lodash.merge')
const build = require('./build')
const dev = require('./dev')
const test = require('./test')
const updateConfig = require('./update-config')
const detectFreePort = require('./detect-free-port')
const mergeConfig = require('./merge-config')
const _ = require('./utils')

module.exports = co.wrap(function * (options) {
  const defaultConfigPath = Path.resolve(
    typeof options.config === 'string' ?
      options.config :
      'vue.config'
  )

  let fileConfig
  let devConfig
  let prodConfig
  if (options.config !== false) {
    const configFilePath = options.config || defaultConfigPath
    try {
      fileConfig = require(_.cwd(configFilePath))
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        options.config = chalk.red(`[not found] ${configFilePath}`)
      } else {
        throw err
      }
    }

    if (fileConfig) {
      devConfig = fileConfig.development
      prodConfig = fileConfig.production
      delete fileConfig.development
      delete fileConfig.production
    }
  }

  const isDev = options.dev || options.watch

  process.env.NODE_ENV = isDev ? 'development' : 'production'

  let port = 4000

  if (options.dev) {
    port = yield detectFreePort(port)
  }

  if (!port) {
    return
  }

  const buildOptions = merge(
    {port, open: true, notify: true},
    fileConfig,
    isDev ? devConfig : prodConfig,
    options
  )

  buildOptions.dist = buildOptions.dist || 'dist'

  if (buildOptions.test) {
    buildOptions.dev = true
  }

  // even in --watch mode we use webpack.config.prod
  // since it's simply rebuilding.
  let webpackConfig = buildOptions.dev ?
    require('./webpack.config.dev') :
    require('./webpack.config.prod')

  // update webpack config by given options
  webpackConfig = yield updateConfig(webpackConfig, buildOptions)

  // merge user provided webpack config
  webpackConfig = mergeConfig(webpackConfig, buildOptions)

  if (buildOptions.test) {
    test(webpackConfig, buildOptions)
  } else if (buildOptions.dev) {
    yield dev(webpackConfig, buildOptions)
  } else {
    yield build(webpackConfig, buildOptions)
  }
})
