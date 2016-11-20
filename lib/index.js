'use strict'
const path = require('path')
const pathExists = require('path-exists')
const co = require('co')
const chalk = require('chalk')
const merge = require('lodash.merge')
const tildify = require('tildify')
const build = require('./build')
const dev = require('./dev')
const test = require('./test')
const updateConfig = require('./update-config')
const detectFreePort = require('./detect-free-port')
const mergeConfig = require('./merge-config')
const terminalUtils = require('./terminal-utils')

module.exports = co.wrap(function * (options) {
  terminalUtils.clearConsole()

  const configFilePath = path.resolve(options.config || 'vue.config')

  let fileConfig
  let devConfig
  let prodConfig
  if (options.config !== false) {
    const isValid = /\.(js|json)$/.test(configFilePath) && pathExists.sync(configFilePath)
    if (isValid ||
        pathExists.sync(configFilePath + '.js') ||
        pathExists.sync(configFilePath + '.json')) {
      fileConfig = require(configFilePath)
      options.config = configFilePath
    } else {
      options.config = options.config === undefined ?
        false :
        chalk.red(`[not found] ${tildify(configFilePath)}`)
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

  let port = options.port || 4000

  if (options.dev) {
    port = yield detectFreePort(port)
  }

  if (!port) {
    return
  }

  const buildOptions = merge(
    {
      port,
      notify: true,
      host: 'localhost'
    },
    fileConfig,
    isDev ? devConfig : prodConfig,
    options
  )

  buildOptions.dist = buildOptions.dist || 'dist'

  // even in --watch mode we use webpack.config.prod
  // since it's simply rebuilding.
  let webpackConfig = buildOptions.dev ?
    require('./webpack/config.dev') :
    require('./webpack/config.prod')

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
