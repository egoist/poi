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

    if (typeof options.require === 'string' || Array.isArray(options.require)) {
      const requires = [].concat(options.require)
      requires.forEach(name => {
        if (name === 'ts-node/register') {
          return logger.warn(
            `TypeScript is supported by default, no need to require ${name}`
          )
        }
        require(path.resolve('node_modules', name))
      })
    }

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
    logger.inspect('env', this.env)
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
    webpackConfig = webpackConfig || this.createWebpackConfig()
    const compiler = require('@poi/core/webpack')(webpackConfig)
    // TODO: Handle MultiCompiler
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

  hasPlugin(name) {
    return [...this.plugins].find(plugin => plugin.name === name)
  }

  registerPlugin(plugin) {
    // For legacy plugins
    if (typeof plugin === 'function') {
      plugin = { name: 'unknown', apply: plugin }
    }

    if (plugin.command) {
      if (this.cli.isCurrentCommand(plugin.command)) {
        this.plugins.add(plugin)
      }
    } else {
      this.plugins.add(plugin)
    }
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
          : [
              '{name}.config.js',
              '{name}.config.ts',
              '.{name}rc',
              'package.json'
            ]
      })
      useConfig.addLoader({
        test: /\.ts$/,
        loader(filepath) {
          require(path.resolve('node_modules', 'ts-node')).register({
            transpileOnly: true,
            compilerOptions: {
              module: 'commonjs',
              moduleResolution: 'node'
            }
          })
          const config = require(filepath)
          return config.default || config
        }
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
        logger.debug(`Using plugin: ${plugin.name}`)
        plugin.apply(this)
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

  createWebpackConfig({ config, context, chainWebpack } = {}) {
    config = config || new Config()
    context = Object.assign({ type: 'client', command: this.command }, context)
    this.hooks.invoke('chainWebpack', config, context)
    if (chainWebpack) {
      chainWebpack(config, context)
    }
    if (this.options.inspectWebpack) {
      console.log('inspect webpack config', config.toString())
    }
    let webpackConfig = config.toConfig()
    this.hooks.invoke('configureWebpack', userConfig => {
      if (typeof userConfig === 'object') {
        webpackConfig = webpackMerge(webpackConfig, userConfig)
      } else if (typeof userConfig === 'function') {
        webpackConfig = userConfig(webpackConfig, context) || webpackConfig
      }
    })
    if (this.options.debugWebpack) {
      logger.log(
        chalk.bold(
          `webpack config${
            context && context.type ? ` for ${context.type}` : ''
          }: `
        ) +
          require('util').inspect(
            typeof this.options.debugWebpack === 'string'
              ? get(webpackConfig, this.options.debugWebpack)
              : webpackConfig,
            {
              depth: null,
              colors: true
            }
          )
      )
    }
    return webpackConfig
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
