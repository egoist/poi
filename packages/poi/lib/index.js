const path = require('path')
const util = require('util')
const EventEmitter = require('events')
const Conpack = require('conpack')
const UseConfig = require('use-config')
const chalk = require('chalk')
const CLIEngine = require('./cli-engine')
const { localRequire } = require('./utils')
const handleOptions = require('./handle-options')
const Logger = require('./logger')

module.exports = class Poi extends EventEmitter {
  constructor(command, options) {
    super()

    this.logger = new Logger(options)
    this.command = command
    this.options = options
    this.conpack = new Conpack()
    this.cli = new CLIEngine(command)
    this.plugins = new Map()
    this.cli.cac.on('error', err => {
      if (err.name === 'AppError') {
        this.logger.error(err.message)
      } else {
        this.logger.error(chalk.dim(err.stack))
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
      console.log('NODE_ENV is set to ' + this.env)
    }
  }

  extendWebpack(fn) {
    fn(this.conpack, { command: this.command })
    return this
  }

  createCompiler() {
    const webpackConfig = this.conpack.toConfig()
    this.logger.silly('webpack config', util.inspect(webpackConfig, {
      depth: null,
      colors: true
    }))
    return require('webpack')(webpackConfig)
  }

  registerCommand(name, options, handler) {
    this.cli.registerCommand(name, options, handler)
    return this
  }

  registerPlugin(name, plugin) {
    this.plugins.set(name, plugin)
    return this
  }

  registerPlugins(plugins) {
    for (const name in plugins) {
      this.registerPlugin(name, localRequire(name)(plugins[name]))
    }
    return this
  }

  async run() {
    const useConfig = new UseConfig({
      name: 'poi',
      files: ['{name}.config.js', '.{name}rc', 'package.json']
    })
    const { path: configPath, config } = await useConfig.load()
    this.logger.debug('poi config path', configPath)
    this.options = {
      ...config,
      ...this.options
    }
    this.options = await handleOptions(this.logger, {
      entry: 'index.js',
      cwd: process.cwd(),
      ...this.options,
      devServer: {
        host: '0.0.0.0',
        port: 4000,
        ...this.options.devServer
      },
    })
    this.logger.debug('poi options', util.inspect(this.options, {
      depth: null,
      colors: true
    }))
    this.registerPlugin('base-config', require('./plugins/base-config'))
    this.registerPlugin('develop', require('./plugins/develop'))
    this.registerPlugin('build', require('./plugins/build'))

    if (this.plugins.size > 0) {
      for (const plugin of this.plugins.values()) {
        plugin(this)
      }
    }

    await this.cli.runCommand()
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
