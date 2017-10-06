const { Server } = require('karma')

function ensureArray(v) {
  if (!Array.isArray(v)) {
    return [v]
  }
  return v
}

module.exports = (options = {}) => {
  return poi => {
    if (typeof options.extendWebpack === 'function') {
      poi.extendWebpack(options.extendWebpack)
    }

    poi.run('test', webpackConfig => {
      const inferValue = (key, fallback) => {
        if (typeof poi.argv[key] !== 'undefined') {
          return poi.argv[key]
        }
        if (typeof options[key] !== 'undefined') {
          return options[key]
        }
        return fallback
      }

      let files = inferValue('files', ['test/unit/**/*.test.js'])
      files = ensureArray(files)

      const port = inferValue('port', 5001)

      let frameworks = inferValue('frameworks', ['mocha'])
      frameworks = ensureArray(frameworks)

      const watch = inferValue('watch', false)

      const defaultBrowser = inferValue('headless') ? 'ChromeHeadless' : 'Chrome'
      let browsers = inferValue('browsers') || defaultBrowser
      browsers = ensureArray(browsers)

      const coverage = inferValue('coverage')

      const defaultConfig = {
        port,
        frameworks,
        basePath: process.cwd(),
        files,
        reporters: ['mocha'].concat(coverage ? ['coverage'] : []),
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
        preprocessors: files.reduce((current, next) => {
          if (typeof next === 'object' && next.included !== false) {
            current[next.pattern] = ['webpack', 'sourcemap']
          } else if (typeof next === 'string') {
            current[next] = ['webpack', 'sourcemap']
          }
          return current
        }, {}),
        webpackMiddleware: {
          stats: 'errors-only',
          noInfo: true
        },
        browsers,
        singleRun: !watch
      }

      delete webpackConfig.entry

      const karmaConfig = poi.merge(defaultConfig, poi.options.karma)
      karmaConfig.webpack = webpackConfig

      const server = new Server(karmaConfig)

      server.start()
    })
  }
}
