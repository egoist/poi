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
      files.push({ pattern: 'static/**/*', watched: false, included: false, served: true, nocache: false })

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
        proxies: { '/': '/base/static/' },
        reporters: ['mocha'].concat(coverage ? ['coverage'] : []),
        coverageReporter: {
          dir: 'coverage',
          reporters: [
            { type: 'text' },
            { type: 'html', subdir: 'report-html' },
            { type: 'lcov', subdir: 'report-lcov' }
          ]
        },
        preprocessors: files.reduce((current, next) => {
          const key = typeof next === 'object' && next.included !== false ? next.pattern : next
          current[key] = ['webpack']
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

      if (coverage) {
        /* for general usage */
        webpackConfig.module.rules = [
          {
            test: /\.(jsx?)$/,
            exclude: /(node_modules|\.test\.jsx?)/,
            enforce: 'pre',
            loader: 'istanbul-instrumenter-loader',
            query: {
              esModules: true
            }
          }
        ].concat(webpackConfig.module.rules)
        /* for vue (assumes vue-loader) */
        webpackConfig.module.rules = webpackConfig.module.rules
          .map(r => {
            const vueLoaderPos = r.use && r.use.findIndex(u => u.loader === 'vue-loader')
            if (typeof vueLoaderPos === 'undefined' || vueLoaderPos === -1) {
              return r
            }
            const options = r.use[vueLoaderPos].options
            const instrumenterLoader = 'istanbul-instrumenter-loader?esModules=true'
            options.preLoaders = (options.preLoaders || {})
            options.preLoaders.js = typeof options.preLoaders.js === 'string' ?
              `${options.preLoaders.js}!${instrumenterLoader}` :
              instrumenterLoader
            return r
          })
      }

      const karmaConfig = poi.merge(defaultConfig, poi.options.karma)
      karmaConfig.webpack = webpackConfig

      const server = new Server(karmaConfig)

      server.start()
    })
  }
}
