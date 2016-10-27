'use strict'
const _ = require('./utils')

module.exports = function (webpackConfig, options) {
  const Server = require(_.cwd('node_modules/karma')).Server

  const input = options.input.length > 0 || ['./src/**/*', './tests/**/*.test.js']

  const server = new Server(Object.assign({
    port: 5001,
    browsers: ['Chrome', 'PhantomJS'],
    frameworks: ['mocha', 'chai'],
    basePath: _.cwd(),
    files: input,
    preprocessors: input.reduce((current, next) => {
      current[next] = ['webpack', 'sourcemap']
      return current
    }, {}),
    webpack: webpackConfig,
    webpackMiddleware: {
      stats: 'normal'
    }
  }, options.karmaConfig), exitCode => {
    console.log('Karma has exited with ' + exitCode)
    process.exit(exitCode)
  })
  server.start()
}
