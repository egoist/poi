const resolveFrom = require('resolve-from')
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
    this.loadConfig = loadConfig
    this.logger = logger
  }

  get plugins() {
    return this.root.plugins
  }

  get mode() {
    return this.root.mode
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
      this.root.plugins.find(plugin => plugin.resolve.name === name)
    )
  }

  removePlugin(name) {
    this.root.plugins = this.root.plugins.filter(
      plugin => plugin.resolve.name !== name
    )
    return this
  }

  resolveWebpackConfig(opts) {
    return this.root.resolveWebpackConfig(opts)
  }

  resolveWebpackCompiler(opts) {
    return this.root.resolveWebpackCompiler(opts)
  }

  resolve(...args) {
    return this.root.resolve(...args)
  }

  chainWebpack(fn) {
    this.hooks.add('chainWebpack', fn)
    return this
  }

  configureDevServer(fn) {
    this.hooks.add('configureDevServer', fn)
    return this
  }

  bundle() {
    return this.root.bundle()
  }

  setEnvs(envs) {
    return this.root.setEnvs(envs)
  }

  getEnvs() {
    return this.root.getEnvs()
  }

  localResolve(id, globalDir) {
    try {
      return resolveFrom(this.resolve(), id)
    } catch (err) {
      return resolveFrom(globalDir || __dirname, id)
    }
  }

  localRequire(...args) {
    return require(this.localResolve(...args))
  }
}
