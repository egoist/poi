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

    const inferValue = (key, fallback) => {
      if (typeof poi.argv[key] !== 'undefined') {
        return poi.argv[key]
      }
      if (typeof options[key] !== 'undefined') {
        return options[key]
      }
      return fallback
    }

    poi.extendWebpack('test', config => {
      const coverage = inferValue('coverage')

      if (coverage) {
        /* for general usage */
        config.module.rule('istanbul-instrumenter-loader')
          .test(/\.(jsx?)$/)
          .exclude
            .add(/(node_modules|\.test\.jsx?)/)
            .end()
          .pre()
          .use('istanbul-instrumenter-loader')
            .loader('istanbul-instrumenter-loader')
            .options({
              esModules: true
            })

        /* for vue (assumes vue-loader) */
        config.module.rule('vue')
          .use('vue-loader')
          .tap(vueOptions => {
            const instrumenterLoader = 'istanbul-instrumenter-loader?esModules=true'
            vueOptions.preLoaders = (vueOptions.preLoaders || {})
            vueOptions.preLoaders.js = typeof vueOptions.preLoaders.js === 'string' ?
              `${vueOptions.preLoaders.js}!${instrumenterLoader}` :
              instrumenterLoader
            return vueOptions
          })
      }
    })

    poi.run('test', webpackConfig => {
      let files = inferValue('files', ['test/unit/**/*.test.js'])
      files = ensureArray(files)
      files.push({ pattern: 'static/**/*', watched: false, included: false, served: true, nocache: false })

      const port = inferValue('port', 5001)

      let frameworks = inferValue('frameworks', ['mocha'])
      frameworks = ensureArray(frameworks)

      const watch = inferValue('watch', false)
      const coverage = inferValue('coverage')

      const defaultBrowser = inferValue('headless') ? 'ChromeHeadless' : 'Chrome'
      let browsers = inferValue('browsers') || defaultBrowser
      browsers = ensureArray(browsers)

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

      const karmaConfig = poi.merge(defaultConfig, poi.options.karma)
      karmaConfig.webpack = webpackConfig

      const server = new Server(karmaConfig)

      server.start()
    })
  }
}
