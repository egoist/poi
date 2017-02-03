'use strict'
const _ = require('./utils')

module.exports = function (webpackConfig, options) {
  const Server = require(_.cwd('node_modules/karma')).Server

  const inputFiles = options.inputFiles || ['./src/**/*', './tests/**/*.test.js']

  let karmaConfig = options.karmaConfig

  if (typeof karmaConfig === 'string') {
    karmaConfig = require(_.cwd(options.karmaConfig))
  }

  if (karmaConfig === 'function') {
    karmaConfig = karmaConfig(webpackConfig, options)
  }

  const server = new Server(Object.assign({
    port: 5001,
    browsers: ['Chrome', 'PhantomJS'],
    frameworks: ['mocha', 'chai'],
    basePath: _.cwd(),
    files: inputFiles,
    preprocessors: inputFiles.reduce((current, next) => {
      current[next] = ['webpack', 'sourcemap']
      return current
    }, {}),
    webpack: webpackConfig,
    webpackMiddleware: {
      stats: 'normal'
    }
  }, karmaConfig), exitCode => {
    console.log('Karma has exited with ' + exitCode)
    process.exit(exitCode)
  })
  server.start()
}
