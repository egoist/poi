const path = require('path')
const fs = require('fs-extra')
const logger = require('@poi/cli-utils/logger')
const loadConfig = require('./utils/load-config')

module.exports = class Plugin {
  /**
   * Creates an instance of Plugin.
   * @param {*} poi Root API
   * @param {string} name Plugin name
   */
  constructor(poi, name) {
    this._name = name
    this.root = poi

    poi._commands = poi._commands || new Map()

    // Exposed
    this.commands = poi._commands
    this.hooks = poi.hooks
    this.pkg = poi.pkg
    this.config = poi.config
    this.options = poi.options
    this.cliOptions = poi.cliOptions
    this.loadConfig = loadConfig
    this.logger = logger
  }

  get plugins() {
    return this.root.plugins
  }

  registerCommand(command, desc, handler) {
    if (this.commands.has(command)) {
      logger.debug(
        `Plugin "${
          this._name
        }" overrided the command "${command}" that was previously added by plugin "${this.commands.get(
          command
        )}"`
      )
    }
    this.commands.set(command, this._name)
    return this.root.cli.command(command, desc, handler)
  }

  hasPlugin(name) {
    return (
      this.root.plugins &&
      this.root.plugins.find(plugin => plugin.name === name)
    )
  }

  removePlugin(name) {
    this.root.plugins = this.root.plugins.filter(plugin => plugin.name !== name)
    return this
  }

  resolveWebpackConfig(opts) {
    const WebpackChain = require('webpack-chain')
    const config = new WebpackChain()

    this.hooks.invoke(
      'chainWebpack',
      config,
      Object.assign({ type: 'client' }, opts)
    )

    if (this.cliOptions.inspectWebpack) {
      console.log(config.toString())
      process.exit() // eslint-disable-line unicorn/no-process-exit
    }

    return config.toConfig()
  }

  resolve(...args) {
    return path.resolve(this.options.baseDir, ...args)
  }

  chainWebpack(fn) {
    this.hooks.add('chainWebpack', fn)
    return this
  }

  configureDevServer(fn) {
    this.hooks.add('configureDevServer', fn)
    return this
  }

  async bundle() {
    const compiler = require('webpack')(this.resolveWebpackConfig())
    if (this.options.cleanOutDir) {
      await fs.remove(compiler.options.output.path)
    }
    return new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) return reject(err)
        resolve(stats)
      })
    })
  }
}
