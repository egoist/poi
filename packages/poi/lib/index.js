const path = require('path')
const util = require('util')
const EventEmitter = require('events')
const Conpack = require('conpack')
const UseConfig = require('use-config')
const chalk = require('chalk')
const parseJsonConfig = require('parse-json-config')
const CLIEngine = require('./cli-engine')
const handleOptions = require('./handle-options')
const logger = require('./logger')

module.exports = class Poi extends EventEmitter {
  constructor(command = 'build', options) {
    super()
    logger.setOptions(options)
    logger.debug('poi command', command)
    this.command = command
    this.options = options
    this.conpack = new Conpack()
    this.cli = new CLIEngine(command)
    this.plugins = new Set()
    this.cli.cac.on('error', err => {
      if (err.name === 'AppError') {
        logger.error(err.message)
      } else {
        logger.error(chalk.dim(err.stack))
      }
    })

    const oldEnv = process.env.NODE_ENV
    switch (this.command) {
      case 'build':
        process.env.NODE_ENV = 'production'
        break
      case 'test':
        process.env.NODE_ENV = 'test'
        break
      default:
        process.env.NODE_ENV = 'development'
    }
    this.env = process.env.NODE_ENV
    if (oldEnv && this.env !== oldEnv) {
      logger.debug('set process.env.NODE_ENV', this.env)
    }
  }

  extendWebpack(fn) {
    fn(this.conpack, { command: this.command })
    return this
  }

  createCompiler(webpackConfig) {
    webpackConfig = webpackConfig || this.createWebpackConfig()
    logger.silly(
      'webpack config',
      util.inspect(webpackConfig, {
        depth: null,
        colors: true
      })
    )
    return require('webpack')(webpackConfig)
  }

  runCompiler(webpackConfig) {
    const compiler = this.createCompiler(webpackConfig)
    return new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) return reject(err)
        resolve(stats)
      })
    })
  }

  registerPlugin(plugin) {
    this.plugins.add(plugin)
    return this
  }

  registerPlugins(plugins) {
    plugins = Array.isArray(plugins) ? plugins : [plugins]
    for (const plugin of parseJsonConfig(plugins, { prefix: 'poi-plugin-' })) {
      this.registerPlugin(plugin)
    }
    return this
  }

  async prepare() {
    const useConfig = new UseConfig({
      name: 'poi',
      files: ['{name}.config.js', '.{name}rc', 'package.json']
    })
    const { path: configPath, config } = await useConfig.load()
    logger.debug('poi config path', configPath)
    this.options = {
      ...config,
      ...this.options
    }
    this.options = await handleOptions({
      entry: 'index.js',
      cwd: process.cwd(),
      ...this.options,
      devServer: {
        host: '0.0.0.0',
        port: 4000,
        ...this.options.devServer
      }
    })

    logger.debug(
      'poi options',
      util.inspect(this.options, {
        depth: null,
        colors: true
      })
    )

    this.registerPlugin(require('./plugins/base-config'))
    this.registerPlugin(require('./plugins/develop'))
    this.registerPlugin(require('./plugins/build'))
    this.registerPlugin(require('./plugins/watch'))

    if (this.options.plugins) {
      this.registerPlugins(this.options.plugins)
    }

    if (this.plugins.size > 0) {
      for (const plugin of this.plugins) {
        plugin(this)
      }
    }
  }

  async run() {
    await this.prepare()
    await this.cli.runCommand()
  }

  createWebpackConfig() {
    if (this.options.extendWebpack) {
      logger.debug('extend webpack from user config')
      this.extendWebpack(this.options.extendWebpack)
    }
    return this.conpack.toConfig()
  }

  resolveCwd(...args) {
    return path.resolve(this.options.cwd, ...args)
  }

  inferDefaultValue(value) {
    if (typeof value !== 'undefined') {
      return value
    }
    return this.command === 'build'
  }
}
