const path = require('path')
const fs = require('fs-extra')
const merge = require('lodash.merge')
const logger = require('@poi/cli-utils/logger')
const loadPlugins = require('./utils/load-plugins')
const Plugin = require('./plugin')
const loadConfig = require('./utils/load-config')
const Hooks = require('./hooks')
const loadPkg = require('./utils/load-pkg')

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
    this.internals = {}
    this.buildId = Math.random()
      .toString(36)
      .substring(7)

    const { command } = this.options
    process.env.POI_COMMAND = command

    logger.setOptions({
      debug: this.options.debug
    })

    this.pkg = loadPkg({ cwd: this.options.baseDir })

    // Load .env file before loading config file
    const envs = this.loadEnvs()

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

    // Merge envs with this.config.envs
    // Allow to embed these env variables in app code
    this.setAppEnvs(envs)

    this.cli = require('cac')({ bin: 'poi' })
  }

  hook(name, fn) {
    return this.hooks.add(name, fn)
  }

  resolve(...args) {
    return path.resolve(this.options.baseDir, ...args)
  }

  prepare() {
    this.applyPlugins()
    logger.debug('App envs', JSON.stringify(this.getEnvs(), null, 2))

    if (this.internals.watchPkg) {
      this.pkg.watch()
    }
  }

  loadEnvs() {
    const { NODE_ENV } = process.env
    const dotenvPath = this.resolve('.env')
    const dotenvFiles = [
      NODE_ENV && `${dotenvPath}.${NODE_ENV}.local`,
      NODE_ENV && `${dotenvPath}.${NODE_ENV}`,
      // Don't include `.env.local` for `test` environment
      // since normally you expect tests to produce the same
      // results for everyone
      NODE_ENV !== 'test' && `${dotenvPath}.local`,
      dotenvPath
    ].filter(Boolean)

    const envs = {}

    dotenvFiles.forEach(dotenvFile => {
      if (fs.existsSync(dotenvFile)) {
        logger.debug('Using env file:', dotenvFile)
        const config = require('dotenv-expand')(
          require('dotenv').config({
            path: dotenvFile
          })
        )
        // Collect all variables from .env file
        Object.assign(envs, config.parsed)
      }
    })

    // Collect those temp envs starting with POI_ too
    for (const name of Object.keys(process.env)) {
      if (name.startsWith('POI_')) {
        envs[name] = process.env[name]
      }
    }

    return envs
  }

  // Get envs that will be embed in app code
  getEnvs() {
    return Object.assign({}, this.config.envs, {
      NODE_ENV:
        this.internals.mode === 'production' ? 'production' : 'development',
      PUBLIC_PATH: this.config.publicPath
    })
  }

  setAppEnvs(envs) {
    this.config.envs = Object.assign({}, this.config.envs, envs)
    return this
  }

  applyPlugins() {
    const plugins = [
      require.resolve('./plugins/config-base'),
      require.resolve('./plugins/config-html'),
      {
        resolve: require.resolve('./plugins/config-electron'),
        options: this.config.electron
      },
      require.resolve('./plugins/command-build'),
      require.resolve('./plugins/command-dev'),
      require.resolve('./plugins/command-watch'),
      require.resolve('./plugins/command-why'),
      ...(this.config.plugins || [])
    ]

    this.plugins = loadPlugins(plugins, this.options.baseDir)
    for (const plugin of this.plugins) {
      if (plugin.resolve.commandInternals) {
        this.setCommandInternals(plugin.resolve)
      }
    }
    for (const plugin of this.plugins) {
      const { resolve, options } = plugin
      const api = new Plugin(this, resolve.name)
      resolve.apply(api, options)
    }
  }

  setCommandInternals({ commandInternals, name }) {
    for (const command of Object.keys(commandInternals)) {
      if (this.options.command === command) {
        const internals = commandInternals[command]
        this.internals = Object.assign({}, this.internals, internals)
        if (internals.mode) {
          this.setAppEnvs({
            POI_MODE: internals.mode
          })
          logger.debug(
            `Plugin '${name}' sets the current command internals to '${JSON.stringify(
              this.internals,
              null,
              2
            )}'`
          )
        }
      }
    }
    return this
  }

  async run() {
    this.prepare()
    await this.hooks.invokePromise('beforeRun')
    return new Promise(resolve => {
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
      this.cli.on('executed', () => {
        if (this._inspectWebpackConfigPath) {
          require('@poi/dev-utils/open')(this._inspectWebpackConfigPath)
        }
        resolve()
      })
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
      this._inspectWebpackConfigPath = path.join(
        require('os').tmpdir(),
        `poi-inspect-webpack-config-${this.buildId}.js`
      )
      fs.appendFileSync(
        this._inspectWebpackConfigPath,
        `//${JSON.stringify(opts)}\nconst ${opts.type} = ${config.toString()}\n`
      )
    }

    return config.toConfig()
  }

  createWebpackCompiler(webpackConfig) {
    return require('webpack')(webpackConfig)
  }

  runWebpack(webpackConfig) {
    const compiler = this.createWebpackCompiler(webpackConfig)
    return require('@poi/dev-utils/runCompiler')(compiler)
  }

  async bundle() {
    const webpackConfig = this.resolveWebpackConfig()
    if (this.options.cleanOutDir) {
      await fs.remove(webpackConfig.output.path)
    }
    return this.runWebpack(webpackConfig)
  }

  hasDependency(name, type = 'all') {
    const prodDeps = Object.keys(this.pkg.data.dependencies || {})
    const devDeps = Object.keys(this.pkg.data.devDependencies || {})
    if (type === 'all') {
      return prodDeps.concat(devDeps).includes(name)
    }
    if (type === 'prod') {
      return prodDeps.includes(name)
    }
    if (type === 'dev') {
      return devDeps.includes(name)
    }
    throw new Error(`Unknow dep type: ${type}`)
  }
}

module.exports = (...args) => new Poi(...args)
