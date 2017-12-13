const path = require('path')
const EventEmitter = require('events')
const yargs = require('yargs')
const webpack = require('webpack')
const PostCompilePlugin = require('post-compile-webpack-plugin')
const webpackMerge = require('webpack-merge')
const rm = require('rimraf')
const ware = require('ware')
const merge = require('lodash/merge')
const MemoryFS = require('memory-fs')
const parsePresets = require('parse-json-config')
const webpackUtils = require('./webpack-utils')
const createConfig = require('./create-config')
const createServer = require('./server')
const { promisify, readPkg } = require('./utils')
const handleOptions = require('./handle-options')

function runWebpack(compiler) {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err)
      resolve(stats)
    })
  })
}

class Poi extends EventEmitter {
  constructor(options) {
    super()
    this.options = Object.assign(
      {
        cwd: '.',
        argv: yargs.argv,
        // Required for cloud IDE like cloud9
        host: process.env.HOST || '0.0.0.0',
        port: process.env.PORT || 4000
      },
      options
    )

    if (!process.env.NODE_ENV) {
      // env could be `production` `development` `test`
      process.env.NODE_ENV =
        this.options.mode === 'watch' ? 'development' : this.options.mode
    }

    this.manifest = readPkg()
    this.middlewares = []
    this.webpackFlows = []
  }

  /*
  Load everything that's required for creating our webpack config
  */
  prepare() {
    return handleOptions(this.options).then(options => {
      this.options = options
    })
  }

  createWebpackConfig() {
    if (this.webpackConfig) return this.webpackConfig.toConfig()

    this.usePresets()
    this.addWebpackFlow(config => {
      config.plugin('compile-notifier').use(PostCompilePlugin, [
        stats => {
          this.emit('compile-done', stats)
        }
      ])
    })
    if (this.options.extendWebpack) {
      this.addWebpackFlow(this.options.extendWebpack)
    }

    this.webpackConfig = createConfig(this.options)
    this.webpackFlows.forEach(flow => flow(this.webpackConfig))
    const config = this.webpackConfig.toConfig()
    if (this.options.webpack) {
      return typeof this.options.webpack === 'function' ?
        this.options.webpack(config) :
        webpackMerge(config, this.options.webpack)
    }
    return config
  }

  build() {
    return this.prepare()
      .then(() => this.runMiddlewares())
      .then(webpackConfig => {
        this.createCompiler(webpackConfig)
        const { filename, path: outputPath } = this.compiler.options.output
        // Only remove dist file when name contains hash
        const implicitlyRemoveDist =
          this.options.removeDist !== false &&
          /\[(chunk)?hash:?\d?\]/.test(filename)
        if (this.options.removeDist === true || implicitlyRemoveDist) {
          return promisify(rm)(path.join(outputPath, '*'))
        }
      })
      .then(() => runWebpack(this.compiler))
  }

  watch() {
    return this.prepare()
      .then(() => this.runMiddlewares())
      .then(webpackConfig => {
        this.createCompiler(webpackConfig)
        return this.compiler.watch({}, () => {})
      })
  }

  dev() {
    return this.prepare()
      .then(() => this.runMiddlewares())
      .then(webpackConfig => {
        this.createCompiler(webpackConfig)
        return createServer(this.compiler, this.options)
      })
  }

  createCompiler(webpackConfig) {
    this.compiler = webpack(webpackConfig)
    if (this.options.inMemory) {
      this.compiler.outputFileSystem = new MemoryFS()
    }
    return this
  }

  addWebpackFlow(mode, fn) {
    if (typeof mode === 'function') {
      this.webpackFlows.push(mode)
    } else if (this.isMode(mode)) {
      this.webpackFlows.push(fn)
    }
    return this
  }

  addMiddleware(mode, fn) {
    if (typeof mode === 'function') {
      this.middlewares.push(mode)
    } else if (this.isMode(mode)) {
      this.middlewares.push(fn)
    }
    return this
  }

  isMode(mode) {
    const currentMode = this.options.mode
    const isWildcard = mode === '*'
    const isMode = typeof mode === 'string' && mode === currentMode
    const hasMode = Array.isArray(mode) && mode.indexOf(currentMode) > -1
    return isWildcard || isMode || hasMode
  }

  usePresets() {
    const presetContext = {
      isMode: this.isMode.bind(this),
      run: this.addMiddleware.bind(this),
      extendWebpack: this.addWebpackFlow.bind(this),
      on: this.on.bind(this),
      once: this.once.bind(this),
      options: this.options,
      argv: this.options.argv,
      manifest: this.manifest,
      webpackUtils,
      runWebpack,
      merge
    }

    let presets = this.options.presets
    if (presets) {
      if (typeof presets === 'string' || typeof presets === 'function') {
        presets = [presets]
      }
      presets = parsePresets(presets, {
        prefix: 'poi-preset-'
      })
      if (presets) {
        presets.forEach(preset => preset(presetContext))
      }
    }
  }

  runMiddlewares() {
    return new Promise((resolve, reject) => {
      const webpackConfig = this.createWebpackConfig()
      ware()
        .use(this.middlewares)
        .run(webpackConfig, err => {
          if (err) return reject(err)
          resolve(webpackConfig)
        })
    })
  }
}

module.exports = options => new Poi(options)
