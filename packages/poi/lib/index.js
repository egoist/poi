const path = require('path')
const EventEmitter = require('events')
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
  constructor(options = {}) {
    super()
    this.options = options
    this.mode = options.mode
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

  process() {
    if (this.options.extendWebpack) {
      this.options.extendWebpack.call(this, this.webpackConfig)
    }

    if (!this.options.presets) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      ware()
        .use(this.options.presets)
        .run(this, err => {
          if (err) return reject(err)
          resolve()
        })
    })
  }
}

module.exports = options => new Poi(options)
