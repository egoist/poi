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
const defaultBabelOptions = require('./webpack/babel-options')
const requireWithContent = require('./require-with-context')

module.exports = co.wrap(function * (options) {
  terminalUtils.clearConsole()

  let configFilePath = path.resolve(options.config || 'vue.config.js')

  let fileConfig
  let devConfig
  let prodConfig
  if (options.config !== false) {
    if (!/\.js$/.test(configFilePath)) {
      configFilePath += '.js'
    }
    if (yield pathExists(configFilePath)) {
      fileConfig = yield requireWithContent(configFilePath)
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

  if (options.watch) {
    options.dev = true
  }
  const isDev = options.dev

  process.env.NODE_ENV = isDev ? 'development' : 'production'

  let port = options.port || 4000

  if (options.dev) {
    port = yield detectFreePort(port)
    if (!port) {
      return
    }
  }

  const buildOptions = merge(
    {
      port,
      notify: true,
      host: 'localhost',
      dist: 'dist',
      babel: defaultBabelOptions,
      static: {
        from: 'static',
        to: './'
      }
    },
    fileConfig,
    isDev ? devConfig : prodConfig,
    options
  )

  let webpackConfig = isDev ?
    require('./webpack/config.dev') :
    require('./webpack/config.prod')

  // update webpack config by given options
  webpackConfig = yield updateConfig(webpackConfig, buildOptions)

  // merge user provided webpack config
  webpackConfig = mergeConfig(webpackConfig, buildOptions)

  if (buildOptions.test) {
    test(webpackConfig, buildOptions)
  } else if (buildOptions.dev && !buildOptions.watch) {
    yield dev(webpackConfig, buildOptions)
  } else {
    yield build(webpackConfig, buildOptions)
  }
})
