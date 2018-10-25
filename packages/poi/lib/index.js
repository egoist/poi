const path = require('path')
const fs = require('fs-extra')
const merge = require('lodash.merge')
const logger = require('@poi/cli-utils/logger')
const loadPlugins = require('./utils/load-plugins')
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

    process.env.POI_COMMAND = this.options.command

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
        babel: {}
      },
      this.config,
      {
        // Proper overrides
        entry,
        css: Object.assign(
          {
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
    const plugins = [
      require.resolve('./plugins/config-base'),
      require.resolve('./plugins/config-app'),
      require.resolve('./plugins/command-build'),
      require.resolve('./plugins/command-dev'),
      require.resolve('./plugins/command-watch'),
      require.resolve('./plugins/command-why'),
      ...(this.config.plugins || [])
    ]

    this.plugins = loadPlugins(plugins, this.options.baseDir)
    for (const plugin of this.plugins) {
      const { resolve, options } = plugin
      logger.debug(`Using plugin '${resolve.name}'`)
      if (resolve.apply) {
        const pluginApi = new Plugin(this, resolve.name)
        resolve.apply(pluginApi, options)
      }
      if (resolve.commandModes) {
        for (const command of Object.keys(resolve.commandModes)) {
          if (command === this.options.command) {
            this.mode = resolve.commandModes[command]
            logger.debug(
              `Plugin '${
                resolve.name
              }' sets the mode of command '${command}' to '${this.mode}'`
            )
          }
        }
      }
    }
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

  resolveWebpackConfig(opts) {
    const WebpackChain = require('webpack-chain')
    const config = new WebpackChain()

    opts = Object.assign({ type: 'client' }, opts)

    this.hooks.invoke('chainWebpack', config, opts)

    if (this.config.chainWebpack) {
      this.config.chainWebpack(config, opts)
    }

    if (this.options.inspectWebpack) {
      console.log(config.toString())
      process.exit() // eslint-disable-line unicorn/no-process-exit
    }

    return config.toConfig()
  }

  resolveWebpackCompiler(opts) {
    return require('webpack')(this.resolveWebpackConfig(opts))
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

module.exports = (...args) => new Poi(...args)
