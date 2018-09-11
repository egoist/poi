const path = require('path')
const merge = require('lodash.merge')
const resolveFrom = require('resolve-from')
const logger = require('@poi/cli-utils/logger')
const getPlugins = require('./utils/get-plugins')
const Plugin = require('./plugin')
const loadConfig = require('./utils/load-config')
const Hooks = require('./hooks')

class Poi {
  constructor(options = {}, config) {
    const cliOptions = options.cliOptions || {}
    delete options.cliOptions
    this.options = Object.assign({}, options, {
      baseDir: path.resolve(options.baseDir || '.'),
      cleanOutDir:
        options.cleanOutDir === undefined ? true : options.cleanOutDir
    })
    this.cliOptions = Object.assign({}, cliOptions, {
      args: cliOptions.args || process.argv.slice(3)
    })
    this.hooks = new Hooks()
    this.config = Object.assign({}, config)

    logger.setOptions({
      debug: this.cliOptions.debug
    })

    this.pkg = Object.assign(
      { data: {} },
      loadConfig.loadSync({
        files: ['package.json'],
        cwd: this.options.baseDir
      })
    )

    // Expose poi command in env variable
    // In case you wanna use it in config file or somewhere
    process.env.POI_COMMAND = this.options.command
    // TODO: Should we set the default value of `process.env.NODE_ENV` here
    // based on the value of `command` too?
    /* e.g.
    process.env.NODE_ENV =
      process.env.NODE_ENV || this.options.command === 'build'
        ? 'production'
        : this.options.command === 'test'
          ? 'test'
          : 'development'
    */

    if (this.options.configFile !== false) {
      const res = loadConfig.loadSync({
        files:
          typeof this.options.configFile === 'string'
            ? [this.options.configFile]
            : ['poi.config.js', 'package.json'],
        cwd: this.options.baseDir,
        packageKey: 'poi'
      })
      if (res.path) {
        this.configFilePath = res.path
        this.config = merge(res.data, this.config)
        logger.debug(`Poi config file: ${this.configFilePath}`)
      } else {
        logger.debug('Poi is not using any config file')
      }
    }

    let defaultEntry = this.config.entry || './index.js'
    if (Array.isArray(defaultEntry) && defaultEntry.length === 0) {
      defaultEntry = './index.js'
    }
    this.config = Object.assign(
      {
        // Default values
        outDir: 'dist',
        target: 'app',
        publicPath: '/',
        pluginOptions: {},
        sourceMap: true,
        minimize: this.options.command === 'build',
        entry: defaultEntry
      },
      this.config,
      {
        // Proper overrides
        css: Object.assign(
          {
            extract: this.options.command === 'build',
            loaderOptions: {}
          },
          this.config.css
        ),
        devServer: Object.assign(
          {
            host: this.config.host || process.env.HOST || '0.0.0.0',
            port: this.config.port || process.env.PORT || 4000
          },
          this.config.devServer
        ),
        filenames: require('./utils/get-filenames')({
          filenames: this.config.filenames,
          filenameHash: this.config.filenameHash,
          command: this.options.command
        })
      }
    )

    this.cli = require('cac')({ bin: 'poi' })
  }

  applyPlugins() {
    const pluginsFromPackage = [
      ...Object.keys(this.pkg.data.dependencies || {}),
      ...Object.keys(this.pkg.data.devDependencies || {})
    ]
      .filter(name => {
        return name.startsWith('poi-plugin-') || name.startsWith('@poi/plugin-')
      })
      .sort((a, b) => a < b)

    let plugins = [
      require('./plugins/build'),
      require('./plugins/dev'),
      require('./plugins/config-base'),
      require('./plugins/config-dev'),
      require('./plugins/config-build'),
      require('./plugins/config-app'),
      require('@poi/plugin-generator'),
      ...pluginsFromPackage.map(plugin => {
        return require(resolveFrom(this.options.baseDir, plugin))
      })
    ]

    if (this.config.plugins) {
      plugins = plugins.concat(
        getPlugins(this.config.plugins, this.options.baseDir)
      )
    }

    this.plugins = plugins

    for (const plugin of plugins) {
      if (plugin.extend) {
        const pluginApi = new Plugin(this, plugin.name)
        plugin.extend(pluginApi, this.config.pluginOptions[plugin.name] || {})
      }
    }
  }

  run() {
    return new Promise(resolve => {
      this.applyPlugins()
      const { input, flags } = this.cli.parse([
        this.options.command,
        ...this.cliOptions.args
      ])
      if (!this.cli.matchedCommand && !flags.help) {
        if (input[0]) {
          logger.error(
            'Unknown command, run `poi --help` to get a list of available commands.'
          )
        } else {
          this.cli.showHelp()
        }
        return resolve()
      }
      this.cli.on('executed', resolve)
    })
  }
}

module.exports = (...args) => new Poi(...args)
