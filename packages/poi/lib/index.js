const path = require('path')
const EventEmitter = require('events')
const Conpack = require('conpack')
const UseConfig = require('use-config')
const chalk = require('chalk')
const parseJsonConfig = require('parse-json-config')
const chokidar = require('chokidar')
const CLIEngine = require('./cliEngine')
const handleOptions = require('./handleOptions')
const logger = require('@poi/logger')
const { ownDir } = require('./utils/dir')

module.exports = class Poi extends EventEmitter {
  constructor(command = 'build', options = {}) {
    super()
    logger.setOptions(options)
    logger.debug('command', command)
    this.logger = logger
    this.command = command
    this.options = Object.assign({}, options)
    this.rerun = () => {
      const poi = new Poi(command, options)
      return poi.run()
    }
    this.conpack = new Conpack()
    this.cli = new CLIEngine(command)
    this.plugins = new Set()
    this.ownDir = ownDir
    this.extendWebpackFns = []
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
    this.extendWebpackFns.push(fn)
    return this
  }

  createCompiler(webpackConfig) {
    webpackConfig = webpackConfig || this.createWebpackConfig()

    return require('@poi/create-webpack-config/webpack')(webpackConfig)
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
    const useConfig = new UseConfig({
      name: 'poi',
      files: this.options.config
        ? [this.options.config]
        : ['{name}.config.js', '.{name}rc', 'package.json']
    })
    const { path: configPath, config } = await useConfig.load()

    logger.debug('poi config path', configPath)
    this.configFile = configPath
    this.options = {
      ...config,
      ...this.options
    }
    this.options = await handleOptions(this.options, this.command)

    logger.inspect('poi options', this.options)

    this.registerPlugin(require('./plugins/baseConfig'))
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

    this.extendWebpackFns.forEach(fn => {
      fn(this.conpack, { command: this.command })
    })
  }

  async run() {
    await this.prepare()
    this.watchRun(await this.cli.runCommand())
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
      ...[].concat(this.options.config || ['poi.config.js', '.poirc']),
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

  createWebpackConfig() {
    if (this.options.extendWebpack) {
      logger.debug('extend webpack from user config')
      this.extendWebpack(this.options.extendWebpack)
    }
    const config = this.conpack.toConfig()
    if (this.options.debugWebpack) {
      console.log(
        require('util').inspect(config, {
          depth: null,
          colors: true
        })
      )
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
