const path = require('path')
const EventEmitter = require('events')
const Config = require('webpack-chain')
const webpackMerge = require('webpack-merge')
const UseConfig = require('use-config')
const chalk = require('chalk')
const get = require('lodash/get')
const merge = require('lodash/merge')
const parseJsonConfig = require('parse-json-config')
const chokidar = require('chokidar')
const CLIEngine = require('./cliEngine')
const handleOptions = require('./handleOptions')
const logger = require('@poi/logger')
const { ownDir } = require('./utils/dir')
const deleteCache = require('./utils/deleteCache')
const PoiError = require('./utils/PoiError')
const loadEnv = require('./utils/loadEnv')
const Hooks = require('./utils/hooks')

module.exports = class Poi extends EventEmitter {
  constructor(command = 'build', options = {}) {
    super()
    logger.setOptions(options)
    logger.debug('command', command)

    // Assign stuffs to context so external plugins can access them as well
    this.logger = logger
    this.ownDir = ownDir

    this.command = command
    this.options = Object.assign({}, options)
    this.rerun = () => {
      // Delete cache
      deleteCache()

      const poi = new Poi(command, options)
      return poi.run()
    }
    this.webpackConfig = new Config()
    this.cli = new CLIEngine(command)
    this.plugins = new Set()
    this.hooks = new Hooks()

    this.cli.cac.on('error', err => {
      if (err.name === 'PoiError') {
        logger.error(err.message)
      } else {
        logger.error(chalk.dim(err.stack))
      }
    })

    if (!process.env.NODE_ENV) {
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
    }
    this.env = {
      NODE_ENV: process.env.NODE_ENV
    }
    if (this.options.env !== false) {
      Object.assign(this.env, loadEnv(process.env.NODE_ENV))
    }
    logger.debug('env', this.env)
  }

  chainWebpack(fn) {
    this.hooks.add('chainWebpack', fn)
    return this
  }

  configureWebpack(fn) {
    this.hooks.add('configureWebpack', updateConfig => {
      updateConfig(fn)
    })
    return this
  }

  configureDevServer(fn) {
    this.hooks.add('configureDevServer', fn)
    return this
  }

  createCompiler(webpackConfig) {
    webpackConfig = this.createWebpackConfig(webpackConfig)

    const compiler = require('@poi/core/webpack')(webpackConfig)
    if (this.options.outputFileSystem) {
      compiler.outputFileSystem = this.options.outputFileSystem
    }
    return compiler
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
    if (typeof plugins === 'string') {
      plugins = [plugins]
    }
    for (const plugin of parseJsonConfig(plugins, { prefix: 'poi-plugin-' })) {
      this.registerPlugin(plugin)
    }
    return this
  }

  async prepare() {
    let config

    // Load Poi config file
    // You can disable this by setting `config` to false
    if (this.options.config !== false) {
      const useConfig = new UseConfig({
        name: 'poi',
        files: this.options.config
          ? [this.options.config]
          : ['{name}.config.js', '.{name}rc', 'package.json']
      })
      const poiConfig = await useConfig.load()
      if (poiConfig.path) {
        logger.debug('poi config path', poiConfig.path)
        this.configFile = poiConfig.path
        config = poiConfig.config
      } else if (this.options.config) {
        // Config file was specified but not found
        throw new PoiError(
          `Config file was not found at ${this.options.config}`
        )
      }
    }

    this.options = merge(
      typeof config === 'function' ? config(this.options) : config,
      this.options
    )
    this.options = await handleOptions(this)

    logger.inspect('poi options', this.options)

    // Register our internal plugins
    this.registerPlugin(require('./plugins/baseConfig'))
    this.registerPlugin(require('./plugins/develop'))
    this.registerPlugin(require('./plugins/build'))
    this.registerPlugin(require('./plugins/watch'))

    // Register user plugins
    if (this.options.plugins) {
      this.registerPlugins(this.options.plugins)
    }

    // Call plugins
    if (this.plugins.size > 0) {
      for (const plugin of this.plugins) {
        plugin(this)
      }
    }

    // Add options.chainWebpack to the end
    const chainWebpack = this.options.chainWebpack || this.options.extendWebpack
    if (chainWebpack) {
      logger.debug('Use chainWebpack defined in your config file')
      this.chainWebpack(chainWebpack)
    }

    const configureWebpack =
      this.options.configureWebpack || this.options.webpack
    if (configureWebpack) {
      logger.debug('Use configureWebpack defined in your config file')
      this.configureWebpack(configureWebpack)
    }

    this.hooks.invoke('chainWebpack', this.webpackConfig, {
      command: this.command
    })
  }

  async run() {
    await this.prepare()
    const res = await this.cli.runCommand()
    this.watchRun(res)
    return res
  }

  watchRun({ devServer, webpackWatcher } = {}) {
    if (
      this.options.restartOnFileChanges === false ||
      !['watch', 'develop'].includes(this.command) ||
      this.cli.willShowHelp()
    ) {
      return
    }

    const filesToWatch = [
      ...[].concat(this.configFile || ['poi.config.js', '.poirc']),
      ...[].concat(this.options.restartOnFileChanges || [])
    ]

    if (filesToWatch.length === 0) return

    logger.debug('watching files', filesToWatch.join(', '))

    const watcher = chokidar.watch(filesToWatch, {
      ignoreInitial: true
    })
    const handleEvent = filepath => {
      logger.warn(`Restarting due to changes made in: ${filepath}`)
      watcher.close()
      if (devServer) {
        devServer.close(() => this.rerun())
      } else if (webpackWatcher) {
        webpackWatcher.close()
        this.rerun()
      }
    }
    watcher.on('change', handleEvent)
    watcher.on('add', handleEvent)
    watcher.on('unlink', handleEvent)
  }

  createWebpackConfig(webpackConfig) {
    let config = webpackConfig || this.webpackConfig.toConfig()
    this.hooks.invoke('configureWebpack', fn => {
      if (typeof fn === 'object') {
        config = webpackMerge(config, fn)
      } else if (typeof fn === 'function') {
        config = fn(config) || config
      }
    })
    if (this.options.debugWebpack) {
      const log = (config, index) => {
        logger.log(
          chalk.bold(
            `webpack config${typeof index === 'number' ? ` at ${index}` : ''}: `
          ) +
            require('util').inspect(
              typeof this.options.debugWebpack === 'string'
                ? get(config, this.options.debugWebpack)
                : config,
              {
                depth: null,
                colors: true
              }
            )
        )
      }
      if (Array.isArray(config)) {
        config.forEach(log)
      } else {
        log(config)
      }
    }
    return config
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
