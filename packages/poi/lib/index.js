const path = require('path')
const EventEmitter = require('events')
const webpack = require('webpack')
const PostCompilePlugin = require('post-compile-webpack-plugin')
const webpackMerge = require('webpack-merge')
const rm = require('rimraf')
const series = require('promise.series')
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
    this.actions = {
      test: [],
      dev: [],
      build: [],
      watch: []
    }
    this.manifest = readPkg()
    this.webpackConfig = createConfig(this.options)
    this.webpackConfig.plugin('compile-notifier')
      .use(PostCompilePlugin, [stats => {
        if (this.options.mode === 'development' || this.options.mode === 'watch') {
          this.emit('compile-done', stats)
        }
      }])
    if (this.options.presets) {
      const presets = Array.isArray(this.options.presets) ? this.options.presets : [this.options.presets]
      const context = {
        command: (cmd, fn) => {
          if (typeof cmd === 'string') {
            this.actions[cmd].push(fn)
          } else if (Array.isArray(cmd)) {
            cmd.forEach(name => this.actions[name].push(fn))
          }
        },
        options: this.options,
        webpackConfig: this.webpackConfig,
        manifest: this.manifest
      }
      for (const preset of presets) {
        if (!preset.mode || (preset.mode === this.options.mode)) {
          preset(context)
        }
      }
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
    let compiler
    return this.runActions('build')
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
    return this.runActions('watch')
      .then(() => {
        const compiler = webpack(this.getWebpackConfig())
        return compiler.watch({}, (err, stats) => {
          if (err) return this.emit('compile-error', err)
          this.emit('compile-done', stats)
        })
      })
  }

  dev() {
    return this.runActions('dev')
      .then(() => {
        const compiler = webpack(this.getWebpackConfig())
        return createServer(compiler, this.options)
      })
  }

  test() {
    return this.runActions('test')
  }

  runActions(name) {
    if (this.options.extendWebpack) {
      this.options.extendWebpack.call(this, this.webpackConfig)
    }
    return series(this.actions[name].map(fn => () => fn()))
  }
}

module.exports = options => new Poi(options)
