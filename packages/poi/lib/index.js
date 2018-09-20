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
    this.options = Object.assign({}, options, {
      cliArgs: options.cliArgs || process.argv.slice(3),
      baseDir: path.resolve(options.baseDir || '.'),
      cleanOutDir:
        options.cleanOutDir === undefined ? true : options.cleanOutDir
    })
    this.hooks = new Hooks()
    this.config = Object.assign({}, config)
    this.commandModes = {}

    logger.setOptions({
      debug: this.options.debug
    })

    this.pkg = Object.assign(
      { data: {} },
      loadConfig.loadSync({
        files: ['package.json'],
        cwd: this.options.baseDir
      })
    )

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

    let { entry } = this.config
    if (!entry || (Array.isArray(entry) && entry.length === 0)) {
      entry = './index.js'
    }

    this.config = Object.assign(
      {
        // Default values2
        outDir: 'dist',
        target: 'app',
        publicPath: '/',
        pluginOptions: {},
        sourceMap: true,
        minimize: 'auto',
        babel: {}
      },
      this.config,
      {
        // Proper overrides
        entry,
        css: Object.assign(
          {
            extract: 'auto',
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
        )
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
      .sort()

    let plugins = [
      require('./plugins/config-base'),
      require('./plugins/config-app'),
      require('./plugins/command-build'),
      require('./plugins/command-dev'),
      require('./plugins/command-watch'),
      require('./plugins/command-why'),
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
      logger.debug(`Using plugin '${plugin.name}'`)
      if (plugin.extend) {
        const pluginApi = new Plugin(this, plugin.name)
        plugin.extend(pluginApi, this.config.pluginOptions[plugin.name] || {})
      }
      if (plugin.commandModes) {
        for (const command of Object.keys(plugin.commandModes)) {
          const mode = plugin.commandModes[command]
          this.commandModes[command] = mode
          logger.debug(
            `Plugin '${
              plugin.name
            }' sets the mode of command '${command}' to '${mode}'`
          )
        }
      }
    }
  }

  get mode() {
    return this.commandModes[this.options.command]
  }

  run() {
    return new Promise(resolve => {
      this.applyPlugins()
      const { input, flags } = this.cli.parse([
        this.options.command,
        ...this.options.cliArgs
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
