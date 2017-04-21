const path = require('path')
const EventEmitter = require('events')
const webpack = require('webpack')
const PostCompilePlugin = require('post-compile-webpack-plugin')
const webpackMerge = require('webpack-merge')
const rm = require('rimraf')
const createConfig = require('./create-config')
const createServer = require('./server')
const { promisify } = require('./utils')

function runWebpack(compiler) {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err)
      resolve(stats)
    })
  })
}

class VBuild extends EventEmitter {
  constructor(options = {}) {
    super()
    this.options = options
    this.webpackConfig = createConfig(this.options)
    this.webpackConfig.plugin('compile-notifier')
      .use(PostCompilePlugin, [stats => {
        if (this.options.mode === 'development' || this.options.mode === 'watch') {
          this.emit('compile-done', stats)
        }
      }])
    if (this.options.presets) {
      const presets = Array.isArray(this.options.presets) ? this.options.presets : [this.options.presets]
      for (const preset of presets) {
        if (!preset.mode || (preset.mode === this.options.mode)) {
          preset.extendWebpack.call(this, this.webpackConfig)
        }
      }
    }
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
    const compiler = webpack(this.getWebpackConfig())
    return Promise.resolve()
      .then(() => {
        // Only remove dist file when name contains hash
        if (compiler.options.output.filename.indexOf('hash]') > -1) {
          return promisify(rm)(path.join(compiler.options.output.path, '*'))
        }
      })
      .then(() => runWebpack(compiler))
  }

  watch() {
    const compiler = webpack(this.getWebpackConfig())
    return compiler.watch({}, (err, stats) => {
      if (err) return this.emit('compile-error', err)
      this.emit('compile-done', stats)
    })
  }

  prepare() {
    const compiler = webpack(this.getWebpackConfig())
    return createServer(compiler, this.options)
  }
}

module.exports = options => new VBuild(options)
