const path = require('path')
const EventEmitter = require('events')
const yargs = require('yargs')
const webpack = require('webpack')
const PostCompilePlugin = require('post-compile-webpack-plugin')
const webpackMerge = require('webpack-merge')
const rm = require('rimraf')
const ware = require('ware')
const createConfig = require('./create-config')
const createServer = require('./server')
const { promisify, readPkg } = require('./utils')

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
    this.options = Object.assign({
      cwd: '.',
      argv: yargs.argv
    }, options)
    this.manifest = readPkg()
    this.webpackConfig = createConfig(this.options)
    this.webpackConfig.plugin('compile-notifier')
      .use(PostCompilePlugin, [stats => {
        if (this.options.mode === 'development' || this.options.mode === 'watch') {
          this.emit('compile-done', stats)
        }
      }])
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
    let compiler
    return this.process()
      .then(() => {
        compiler = webpack(this.getWebpackConfig())
        // Only remove dist file when name contains hash
        if (compiler.options.output.filename.indexOf('hash]') > -1) {
          return promisify(rm)(path.join(compiler.options.output.path, '*'))
        }
      })
      .then(() => runWebpack(compiler))
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
      argv: this.options.argv
    }

    const presets = Array.isArray(this.options.presets) ? this.options.presets : [this.options.presets]
    if (presets) {
      presets.forEach(preset => preset(presetContext))
    }

    if (this.options.extendWebpack) {
      this.options.extendWebpack.call(this, this.webpackConfig)
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
