const { Server } = require('karma')
const isCI = require('is-ci')

function ensureArray(v) {
  if (!Array.isArray(v)) {
    return [v]
  }
  return v
}

module.exports = (options = {}) => {
  return poi => {
    if (!poi.cli.isCurrentCommand('test')) return

    if (typeof options.chainWebpack === 'function') {
      poi.chainWebpack(options.chainWebpack)
    }

    const inferValue = (key, fallback) => {
      if (typeof poi.options[key] !== 'undefined') {
        return poi.options[key]
      }
      if (typeof options[key] !== 'undefined') {
        return options[key]
      }
      return fallback
    }

    let isTypeScript = false

    poi.chainWebpack(config => {
      const coverage = inferValue('coverage')

      isTypeScript = config.module.rules.has('typescript')

      if (coverage) {
        /* for general usage */
        const istanbulinstrumenterRule = config.module
          .rule('istanbul-instrumenter')
          .test(/\.(jsx?)$/)
          .exclude.add(/(node_modules|\.test\.jsx?)/)
          .end()
          .enforce('pre')
        istanbulinstrumenterRule
          .use('istanbul-instrumenter-loader')
          .loader('istanbul-instrumenter-loader')
          .options({
            esModules: true
          })

        /* for vue (assumes vue-loader) */
        const vueRule = config.module.rule('vue')
        vueRule.use('vue-loader').tap(options => {
          const instrumenterLoader =
            'istanbul-instrumenter-loader?esModules=true'
          options.preLoaders = options.preLoaders || {}
          options.preLoaders.js =
            typeof options.preLoaders.js === 'string'
              ? `${options.preLoaders.js}!${instrumenterLoader}`
              : instrumenterLoader
          return options
        })
      }
    })

    poi.cli.handleCommand('test', 'Unit testing with Karma', () => {
      const webpackConfig = poi.createWebpackConfig()

      let files = inferValue('files', ['test/unit/**/*.test.js'])
      files = ensureArray(files)
      files.push({
        pattern: 'static/**/*',
        watched: false,
        included: false,
        served: true,
        nocache: false
      })

      const port = inferValue('port', 5001)

      let frameworks = inferValue('frameworks', ['mocha'])
      frameworks = ensureArray(frameworks)
      frameworks = frameworks.concat(isTypeScript ? ['karma-typescript'] : [])

      const watch = !isCI && inferValue('watch', false)
      const coverage = inferValue('coverage')

      let reporters = inferValue('reporters', ['mocha'])
      reporters = ensureArray(reporters)
      reporters = reporters.concat(isTypeScript ? ['karma-typescript'] : [])
      reporters = reporters.concat(coverage ? ['coverage'] : [])

      const defaultBrowser = inferValue('headless')
        ? 'ChromeHeadless'
        : 'Chrome'
      let browsers = inferValue('browsers') || defaultBrowser
      browsers = ensureArray(browsers)

      const defaultConfig = {
        port,
        frameworks,
        basePath: process.cwd(),
        files,
        proxies: { '/': '/base/static/' },
        reporters,
        coverageReporter: {
          dir: 'coverage',
          reporters: [
            { type: 'text' },
            { type: 'html', subdir: 'report-html' },
            { type: 'lcov', subdir: 'report-lcov' }
          ]
        },
        preprocessors: files.reduce((current, next) => {
          if (typeof next === 'object' && next.included === false) {
            return current
          }
          const key = next.pattern || next
          current[key] = [
            'webpack',
            ...(isTypeScript ? ['typescript'] : []),
            'sourcemap'
          ]
          return current
        }, {}),
        webpackMiddleware: {
          stats: 'errors-only',
          noInfo: true
        },
        browsers,
        singleRun: !watch
      }

      if (isTypeScript) {
        defaultConfig.karmaTypescriptConfig = {
          tsconfig: './tsconfig.json',
          compilerOptions: {
            module: 'commonjs'
          }
        }
      }

      delete webpackConfig.entry

      const karmaConfig =
        typeof options.karma === 'function'
          ? options.karma(defaultConfig)
          : Object.assign({}, defaultConfig, options.karma)
      karmaConfig.webpack = webpackConfig

      const server = new Server(karmaConfig)
      server.start()
    })
  }
}
