const path = require('path')
const EventEmitter = require('events')
const yargs = require('yargs')
const webpack = require('webpack')
const PostCompilePlugin = require('post-compile-webpack-plugin')
const webpackMerge = require('webpack-merge')
const rm = require('rimraf')
const ware = require('ware')
const merge = require('lodash.merge')
const webpackUtils = require('./webpack-utils')
const createConfig = require('./create-config')
const createServer = require('./server')
const { promisify, readPkg } = require('./utils')

function runWebpack(webpackConfig) {
  const compiler = webpack(webpackConfig)
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
    this.options = Object.assign({
      cwd: '.',
      argv: yargs.argv,
      // Required for cloud IDE like cloud9
      host: process.env.HOST || '0.0.0.0',
      port: process.env.PORT || 4000
    }, options)
    this.manifest = readPkg()
    this.webpackConfig = createConfig(this.options)
    this.webpackConfig.plugin('compile-notifier')
      .use(PostCompilePlugin, [stats => {
        if (this.options.mode === 'development' || this.options.mode === 'watch') {
          this.emit('compile-done', stats)
        }
      }])
    if (this.options.extendWebpack) {
      this.options.extendWebpack.call(this, this.webpackConfig)
    }
  }

  getWebpackConfig() {
    const config = this.webpackConfig.toConfig()
    if (this.options.webpack) {
      return typeof this.options.webpack === 'function' ?
        this.options.webpack(config) :
        webpackMerge(config, this.options.webpack)
    }
    return config
  }

  build() {
    let webpackConfig
    return this.process()
      .then(() => {
        webpackConfig = this.getWebpackConfig()
        // Only remove dist file when name contains hash
        if (/\[(chunk)?hash:?\d?\]/.test(webpackConfig.output.filename)) {
          return promisify(rm)(path.join(webpackConfig.output.path, '*'))
        }
      })
      .then(() => runWebpack(webpackConfig))
  }

  watch() {
    return this.process()
      .then(() => {
        const compiler = webpack(this.getWebpackConfig())
        return compiler.watch({}, () => {})
      })
  }

  dev() {
    return this.process()
      .then(() => {
        const compiler = webpack(this.getWebpackConfig())
        return createServer(compiler, this.options)
      })
  }

  test() {
    return this.process()
  }

  process(mode = this.options.mode) {
    const middlewares = []

    const presetContext = {
      mode: (modes, fn) => {
        const wildcard = modes === '*'
        const isMode = typeof modes === 'string' && modes === mode
        const hasMode = Array.isArray(modes) && modes.indexOf(mode) > -1
        if (wildcard || isMode || hasMode) {
          middlewares.push(fn)
        }
      },
      webpackConfig: this.webpackConfig,
      options: this.options,
      argv: this.options.argv,
      manifest: this.manifest,
      webpackUtils,
      runWebpack,
      merge
    }

    const presets = this.options.presets
    if (presets) {
      if (Array.isArray(presets)) {
        presets.forEach(preset => preset(presetContext))
      } else {
        presets(presetContext)
      }
    }

    if (!middlewares || middlewares.length === 0) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      ware()
        .use(middlewares)
        .run(err => {
          if (err) return reject(err)

          resolve()
        })
    })
  }
}

module.exports = options => new Poi(options)
