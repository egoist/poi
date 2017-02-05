'use strict'
const _ = require('./utils')
const karma = require(_.cwd('node_modules/karma'))
const Server = karma.Server
const cfg = karma.config

module.exports = function (webpackConfig, options) {
  const inputFiles = options.inputFiles || ['./src/**/*', './tests/**/*.test.js']

  // We use Karma's parseConfig, to get a JSON from karma.conf file
  // Unfortunately parseConfig will fill in default/empty values as well
  // So we need to force overwrite on some of them (like webpack config)
  // Object.assing or lodash.defaults wouldn't touch those default values
  const karmaConfig = cfg.parseConfig(_.cwd(options.karmaConfig), {
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
  })

  const server = new Server(karmaConfig, exitCode => {
    console.log('Karma has exited with ' + exitCode)
    process.exit(exitCode)
  })
  server.start()
}
