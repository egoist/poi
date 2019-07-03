const os = require('os')
const path = require('path')
const fs = require('fs-extra')
const resolveFrom = require('resolve-from')
const cac = require('cac')
const chalk = require('chalk')
const merge = require('lodash.merge')
const logger = require('@poi/logger')
const Hooks = require('./Hooks')
const WebpackUtils = require('./WebpackUtils')
const createConfigLoader = require('./utils/createConfigLoader')
const loadEnvs = require('./utils/loadEnvs')
const parseArgs = require('./utils/parseArgs')
const PoiError = require('./utils/PoiError')
const spinner = require('./utils/spinner')
const validateConfig = require('./utils/validateConfig')
const { normalizePlugins, mergePlugins } = require('./utils/plugins')

module.exports = class PoiCore {
  constructor(
    rawArgs = process.argv,
    {
      defaultConfigFiles = [
        'poi.config.js',
        'poi.config.ts',
        'package.json',
        '.poirc',
        '.poirc.json',
        '.poirc.js'
      ],
      extendConfigLoader,
      config: externalConfig
    } = {}
  ) {
    this.rawArgs = rawArgs
    this.logger = logger
    this.spinner = spinner
    this.PoiError = PoiError
    // For plugins, it's only used in plugin.cli export
    this.args = parseArgs(rawArgs)
    this.hooks = new Hooks()
    this.testRunners = new Map()

    if (this.args.has('debug')) {
      logger.setOptions({ debug: true })
    }

    this.mode = this.args.get('mode')
    if (!this.mode) {
      this.mode = 'development'
    }

    if (this.args.has('prod') || this.args.has('production')) {
      this.mode = 'production'
    }

    if (this.args.has('test')) {
      this.mode = 'test'
    }

    if (this.args.args[0] && /^test(:|$)/.test(this.args.args[0])) {
      this.mode = 'test'
    }

    logger.debug(`Running in ${this.mode} mode`)

    this.cwd = this.args.get('cwd')
    if (!this.cwd) {
      this.cwd = process.cwd()
    }

    // Load modules from --require flag
    this.loadRequiredModules()

    this.configLoader = createConfigLoader(this.cwd)

    // For other tools that use Poi under the hood
    if (extendConfigLoader) {
      extendConfigLoader(this.configLoader)
    }

    // Load .env files
    loadEnvs(this.mode, this.resolveCwd('.env'))

    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = this.mode
    }

    this.webpackUtils = new WebpackUtils(this)

    // Try to load config file
    const configFlag =
      this.args.get('config') === undefined
        ? this.args.get('c')
        : this.args.get('config')
    if (externalConfig || configFlag === false) {
      logger.debug('Poi config file was disabled')
      this.config = externalConfig || {}
    } else {
      const configFiles =
        typeof configFlag === 'string' ? [configFlag] : defaultConfigFiles
      const { path: configPath, data: configFn } = this.configLoader.load({
        files: configFiles,
        packageKey: 'poi'
      })
      if (configPath) {
        logger.debug(`Using Poi config file:`, configPath)
      } else {
        logger.debug(`Not using any Poi config file`)
      }
      this.configPath = configPath
      this.config =
        typeof configFn === 'function' ? configFn(this.args.options) : configFn
      this.config = this.config || {}
    }

    this.pkg = this.configLoader.load({
      files: ['package.json']
    })
    this.pkg.data = this.pkg.data || {}

    // Initialize plugins
    this.initPlugins()
    // Init CLI instance, call plugin.cli, parse CLI args
    this.initCLI()
    // Merge cli config with config file
    this.mergeConfig()
    // Call plugin.apply
    this.applyPlugins()
    this.hooks.invoke('createConfig', this.config)
  }

  get isProd() {
    return this.mode === 'production'
  }

  initCLI() {
    const cli = (this.cli = cac())
    this.command = cli
      .command('[...entries]', 'Entry files to start bundling', {
        ignoreOptionDefaultValue: true
      })
      .usage('[...entries] [options]')
      .action(async () => {
        logger.debug(`Using default handler`)
        const chain = this.createWebpackChain()
        const compiler = this.createWebpackCompiler(chain.toConfig())
        await this.runCompiler(compiler)
      })

    this.extendCLI()

    // Global options
    cli
      .option('--mode <mode>', 'Set mode', 'development')
      .option('--prod, --production', 'Alias for --mode production')
      .option('--test', 'Alias for --mode test')
      .option('--no-config', 'Disable config file')
      .option('-c, --config <path>', 'Set the path to config file')
      .option('-r, --require <module>', 'Require a module before bootstrapping')
      .option(
        '--plugin, --plugins <plugin>',
        'Add a plugin (can be used for multiple times)'
      )
      .option('--debug', 'Show debug logs')
      .option('--inspect-webpack', 'Inspect webpack config in your editor')
      .version(require('../package').version)
      .help(sections => {
        for (const section of sections) {
          if (section.title && section.title.includes('For more info')) {
            const body = section.body.split('\n')
            body.shift()
            body.unshift(
              `  $ ${cli.name} --help`,
              `  $ ${cli.name} --serve --help`,
              `  $ ${cli.name} --prod --help`
            )
            section.body = body.join('\n')
          }
        }
      })

    this.cli.parse(this.rawArgs, { run: false })

    logger.debug('Command args', this.cli.args)
    logger.debug('Command options', this.cli.options)
  }

  loadRequiredModules() {
    // Ensure that ts-node returns a commonjs module
    process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
      module: 'commonjs'
    })

    const requiredModules = this.args.get('require') || this.args.get('r')
    if (requiredModules) {
      ;[].concat(requiredModules).forEach(name => {
        const m = this.localRequire(name)
        if (!m) {
          throw new PoiError({
            message: `Cannot find module "${name}" in current directory!`
          })
        }
      })
    }
  }

  hasDependency(name) {
    return [
      ...Object.keys(this.pkg.data.dependencies || {}),
      ...Object.keys(this.pkg.data.devDependencies || {})
    ].includes(name)
  }

  /**
   * @private
   * @returns {void}
   */
  initPlugins() {
    const cwd = this.configPath
      ? path.dirname(this.configPath)
      : this.resolveCwd()
    const cliPlugins = normalizePlugins(
      this.args.get('plugin') || this.args.get('plugins'),
      cwd
    )
    const configPlugins = normalizePlugins(this.config.plugins, cwd)

    this.plugins = [
      { resolve: require.resolve('./plugins/command-options') },
      { resolve: require.resolve('./plugins/config-babel') },
      { resolve: require.resolve('./plugins/config-vue') },
      { resolve: require.resolve('./plugins/config-css') },
      { resolve: require.resolve('./plugins/config-font') },
      { resolve: require.resolve('./plugins/config-image') },
      { resolve: require.resolve('./plugins/config-eval') },
      { resolve: require.resolve('./plugins/config-html') },
      { resolve: require.resolve('./plugins/config-electron') },
      { resolve: require.resolve('./plugins/config-misc-loaders') },
      { resolve: require.resolve('./plugins/config-reason') },
      { resolve: require.resolve('./plugins/config-yarn-pnp') },
      { resolve: require.resolve('./plugins/config-jsx-import') },
      { resolve: require.resolve('./plugins/watch') },
      { resolve: require.resolve('./plugins/serve') },
      { resolve: require.resolve('./plugins/eject-html') },
      { resolve: require.resolve('@poi/plugin-html-entry') }
    ]
      .concat(mergePlugins(configPlugins, cliPlugins))
      .map(plugin => {
        if (typeof plugin.resolve === 'string') {
          plugin._resolve = plugin.resolve
          plugin.resolve = require(plugin.resolve)
        }
        return plugin
      })
  }

  extendCLI() {
    for (const plugin of this.plugins) {
      if (plugin.resolve.cli) {
        plugin.resolve.cli(this, plugin.options)
      }
    }
  }

  /**
   * @private
   * @returns {void}
   */
  applyPlugins() {
    let plugins = this.plugins.filter(plugin => {
      return !plugin.resolve.when || plugin.resolve.when(this)
    })

    // Run plugin's `filterPlugins` method
    for (const plugin of plugins) {
      if (plugin.resolve.filterPlugins) {
        plugins = plugin.resolve.filterPlugins(this.plugins, plugin.options)
      }
    }

    // Run plugin's `apply` method
    for (const plugin of plugins) {
      if (plugin.resolve.apply) {
        logger.debug(`Apply plugin: \`${chalk.bold(plugin.resolve.name)}\``)
        if (plugin._resolve) {
          logger.debug(`location: ${plugin._resolve}`)
        }
        plugin.resolve.apply(this, plugin.options)
      }
    }
  }

  hasPlugin(name) {
    return (
      this.plugins &&
      this.plugins.find(plugin => {
        return plugin.resolve.name === name
      })
    )
  }

  mergeConfig() {
    const cliConfig = this.createConfigFromCLIOptions()
    logger.debug(`Config from command options`, cliConfig)

    this.config = validateConfig(this, merge({}, this.config, cliConfig))
  }

  hook(name, fn) {
    this.hooks.add(name, fn)
    return this
  }

  registerTestRunner(name, runner) {
    if (this.testRunners.has(name)) {
      throw new PoiError({
        message: `Test runner "${name}" has already been registered!`
      })
    }
    this.testRunners.set(name, runner)
    return this
  }

  resolveCwd(...args) {
    return path.resolve(this.cwd, ...args)
  }

  resolveOutDir(...args) {
    return this.resolveCwd(this.config.output.dir, ...args)
  }

  async run() {
    await this.hooks.invokePromise('beforeRun')

    await this.cli.runMatchedCommand()

    await this.hooks.invokePromise('afterRun')
  }

  createConfigFromCLIOptions() {
    const {
      minimize,
      sourceMap,
      format,
      moduleName,
      outDir,
      publicUrl,
      target,
      clean,
      parallel,
      cache,
      jsx,
      extractCss,
      hot,
      host,
      port,
      open,
      proxy,
      fileNames,
      html,
      publicFolder,
      babelrc,
      babelConfigFile
    } = this.cli.options
    return {
      entry: this.cli.args.length > 0 ? this.cli.args : undefined,
      output: {
        minimize,
        sourceMap,
        format,
        moduleName,
        dir: outDir,
        publicUrl,
        target,
        clean,
        fileNames,
        html
      },
      parallel,
      cache,
      publicFolder,
      babel: {
        jsx,
        babelrc,
        configFile: babelConfigFile
      },
      css: {
        extract: extractCss
      },
      devServer: {
        hot,
        host,
        port,
        open,
        proxy
      }
    }
  }

  createWebpackChain(opts) {
    const WebpackChain = require('./utils/WebpackChain')

    opts = Object.assign({ type: 'client', mode: this.mode }, opts)

    const config = new WebpackChain({
      configureWebpack: this.config.configureWebpack,
      opts
    })

    require('./webpack/webpack.config')(config, this)

    this.hooks.invoke('createWebpackChain', config, opts)

    if (this.config.chainWebpack) {
      this.config.chainWebpack(config, opts)
    }

    if (this.cli.options.inspectWebpack) {
      const inspect = () => {
        const id = Math.random()
          .toString(36)
          .substring(7)
        const outFile = path.join(
          os.tmpdir(),
          `poi-inspect-webpack-config-${id}.js`
        )
        const configString = `// ${JSON.stringify(
          opts
        )}\nvar config = ${config.toString()}\n\n`
        fs.writeFileSync(outFile, configString, 'utf8')
        require('@poi/dev-utils/open')(outFile, {
          wait: false
        })
      }

      config.plugin('inspect-webpack').use(
        class InspectWebpack {
          apply(compiler) {
            compiler.hooks.afterEnvironment.tap('inspect-webpack', inspect)
          }
        }
      )
    }

    return config
  }

  runCompiler(compiler, watch) {
    return new Promise((resolve, reject) => {
      if (watch) {
        compiler.watch({}, err => {
          if (err) return reject(err)
          resolve()
        })
      } else {
        compiler.run((err, stats) => {
          if (err) return reject(err)
          resolve(stats)
        })
      }
    })
  }

  createWebpackCompiler(config) {
    const compiler = require('webpack')(config)

    // Override the .watch method so we can handle error here instead of letting WDM handle it
    // And in fact we disabled WDM logger so errors will never show displayed there
    const originalWatch = compiler.watch.bind(compiler)
    compiler.watch = (options, cb) => {
      return originalWatch(options, (err, stats) => {
        if (err) {
          throw err
        }
        cb(null, stats)
      })
    }

    return compiler
  }

  getCacheConfig(dir, keys, files) {
    let content = ''
    if (files) {
      const file = this.configLoader.resolve({ files: [].concat(files) })
      if (file) {
        content = fs.readFileSync(file, 'utf8')
      }
    }

    return {
      cacheDirectory: this.resolveCwd('node_modules/.cache', dir),
      cacheIdentifier: `${JSON.stringify(keys)}::${content}`
    }
  }

  localResolve(name, cwd = this.cwd) {
    return resolveFrom.silent(cwd, name)
  }

  localRequire(name, cwd) {
    const resolved = this.localResolve(name, cwd)
    return resolved ? require(resolved) : null
  }
}
