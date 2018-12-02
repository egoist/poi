const os = require('os')
const path = require('path')
const fs = require('fs-extra')
const resolveFrom = require('resolve-from')
const cac = require('cac')
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

module.exports = class PoiCore {
  constructor(
    args = process.argv,
    {
      defaultConfigFiles = [
        'poi.config.js',
        '.poirc',
        '.poirc.json',
        '.poirc.js'
      ],
      extendConfigLoader,
      config: externalConfig
    } = {}
  ) {
    this.args = args
    this.logger = logger
    this.spinner = spinner
    this.PoiError = PoiError
    // For plugins, it's only used in onCreateCLI hook
    this.parsedArgs = parseArgs(args.slice(2))
    this.hooks = new Hooks()
    this.testRunners = new Map()

    if (this.parsedArgs.has('debug')) {
      logger.setOptions({ debug: true })
    }

    this.mode = this.parsedArgs.getValue('mode')
    if (!this.mode) {
      this.mode = 'development'
    }

    if (this.parsedArgs.has('prod') || this.parsedArgs.has('production')) {
      this.mode = 'production'
    }

    if (this.parsedArgs.has('test')) {
      this.mode = 'test'
    }

    this.cwd = this.parsedArgs.getValue('cwd')
    if (!this.cwd) {
      this.cwd = process.cwd()
    }

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
    if (externalConfig || this.parsedArgs.has('no-config')) {
      logger.debug('Poi config file was disabled')
      this.config = externalConfig
    } else {
      const configFiles = this.parsedArgs.has('config')
        ? [this.parsedArgs.getValue('config')]
        : defaultConfigFiles
      const { path: configPath, data: config } = this.configLoader.load({
        files: configFiles
      })
      if (configPath) {
        logger.debug(`Using Poi config file:`, configPath)
      } else {
        logger.debug(`Not using any Poi config file`)
      }
      this.configPath = configPath
      this.config = config || {}
    }

    this.pkg = this.configLoader.load({
      files: ['package.json']
    })
    this.pkg.data = this.pkg.data || {}

    // Apply plugins
    this.applyPlugins()

    this.initCLI()
  }

  get isProd() {
    return this.mode === 'production'
  }

  initCLI() {
    const cli = (this.cli = cac())
    const command = (this.defaultCommand = cli
      .command('[...entries]', 'Entry files to start bundling', {
        ignoreOptionDefaultValue: true
      })
      .usage('[...entries] [options]')).action(async () => {
      logger.debug(`Using default handler`)
      const config = this.createWebpackConfig()
      const compiler = this.createWebpackCompiler(config.toConfig())
      await this.runCompiler(compiler)
    })

    this.hooks.invoke('onCreateCLI', { command, args: this.parsedArgs })

    // Global options
    cli
      .option('--mode <mode>', 'Set mode', 'development')
      .option('--prod, --production', 'Alias for --mode production')
      .option('--test', 'Alias for --mode test')
      .option('--no-config', 'Disable config file')
      .option('--config <path>', 'Set the path to config file')
      .option('--debug', 'Show debug logs')
      .option('--inspect-webpack', 'Inspect webpack config in your editor')
      .version(require('../package').version)
      .help()
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
  applyPlugins() {
    this.plugins = [
      require.resolve('./plugins/command-options'),
      require.resolve('./plugins/config-babel'),
      require.resolve('./plugins/config-vue'),
      require.resolve('./plugins/config-css'),
      require.resolve('./plugins/config-font'),
      require.resolve('./plugins/config-image'),
      require.resolve('./plugins/config-html'),
      require.resolve('./plugins/config-electron'),
      require.resolve('./plugins/config-misc-loaders'),
      require.resolve('./plugins/watch'),
      require.resolve('./plugins/serve'),
      require.resolve('./plugins/eject-html')
    ]
      .concat(this.config.plugins || [])
      .map(v => {
        if (typeof v === 'string') {
          v = { resolve: v }
        }
        if (typeof v.resolve === 'string') {
          v = Object.assign({
            resolve: require(resolveFrom(this.resolveCwd(), v.resolve))
          })
        }
        return v
      })
      .filter(Boolean)

    // Run plugin's `filterPlugins` method
    for (const plugin of this.plugins) {
      if (plugin.resolve.filterPlugins) {
        this.plugins = plugin.resolve.filterPlugins(
          this.plugins,
          plugin.resolve.options
        )
      }
    }

    // Run plugin's `apply` method
    for (const plugin of this.plugins) {
      if (plugin.resolve.apply) {
        logger.debug(`Using plugin: "${plugin.resolve.name}"`)
        plugin.resolve.apply(this, plugin.resolve.options)
      }
    }
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
    this.cli.parse(this.args, { run: false })

    logger.debug('CLI args', this.cli.args)
    logger.debug('CLI options', this.cli.options)

    const cliConfig = this.createConfigFromCLIOptions()
    logger.debug(`Config from CLI options`, cliConfig)

    this.config = validateConfig(this, merge(this.config, cliConfig))

    await this.cli.runMatchedCommand()
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
      html
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
      babel: {
        jsx
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

  createWebpackConfig(opts) {
    const WebpackChain = require('webpack-chain')

    const config = new WebpackChain()

    require('./webpack/webpack.config')(config, this)

    opts = Object.assign({ type: 'client' }, opts)

    this.hooks.invoke('onCreateWebpackConfig', config, opts)

    if (this.config.chainWebpack) {
      this.config.chainWebpack(config, opts)
    }

    if (this.cli.options.inspectWebpack) {
      const configString = `// ${JSON.stringify(
        opts
      )}\n${config.toString()}\n\n`

      config.plugin('inspect-webpack').use(
        class InspectWebpack {
          apply(compiler) {
            compiler.hooks.beforeRun.tapPromise('inspect-webpack', async () => {
              const id = Math.random()
                .toString(36)
                .substring(7)
              const outFile = path.join(
                os.tmpdir(),
                `poi-inspect-webpack-config-${id}.js`
              )
              await fs.writeFile(outFile, configString, 'utf8')
              require('@poi/dev-utils/open')(outFile)
            })
          }
        }
      )
    }

    return config
  }

  runCompiler(compiler) {
    return new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) return reject(err)
        resolve(stats)
      })
    })
  }

  createWebpackCompiler(config) {
    return require('webpack')(config)
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
