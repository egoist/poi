const { Server } = require('karma')

function ensureArray(v) {
  if (!Array.isArray(v)) {
    return [v]
  }
  return v
}

module.exports = (options = {}) => {
  return poi => {
    poi.mode('test', () => {
      const inferValue = (key, fallback) => {
        if (typeof poi.argv[key] !== 'undefined') {
          return poi.argv[key]
        }
        if (typeof options[key] !== 'undefined') {
          return options[key]
        }
        return fallback
      }

      let testFiles = inferValue('testFiles', ['test/unit/**/*.test.js'])
      testFiles = ensureArray(testFiles)

      const port = inferValue('port', 5001)

      let testFrameworks = inferValue('testFrameworks', ['mocha'])
      testFrameworks = ensureArray(testFrameworks)

      const watch = inferValue('watch', false)

      const defaultBrowser = inferValue('headless') ? 'ChromeHeadless' : 'Chrome'
      let browsers = inferValue('browsers') || defaultBrowser
      browsers = ensureArray(browsers)

      const coverage = inferValue('coverage')

      const karmaConfig = {
        port,
        frameworks: testFrameworks,
        basePath: process.cwd(),
        files: testFiles,
        reporters: ['spec'].concat(coverage ? ['coverage'] : []),
        coverageReporter: {
          dir: 'coverage',
          reporters: [{
            type: 'html',
            subdir: 'report-html'
          }, {
            type: 'lcov',
            subdir: 'report-lcov'
          }]
        },
        preprocessors: testFiles.reduce((current, next) => {
          current[next] = ['webpack', 'sourcemap']
          return current
        }, {}),
        webpackMiddleware: {
          stats: 'errors-only',
          noInfo: true
        },
        browsers,
        singleRun: !watch
      }

      const webpackConfig = poi.webpackConfig.toConfig()

      delete webpackConfig.entry
      karmaConfig.webpack = webpackConfig

      const server = new Server(karmaConfig)

      server.start()
    })
  }
}
