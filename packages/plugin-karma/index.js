const { Server } = require('karma')

function ensureArray(v) {
  if (!Array.isArray(v)) {
    return [v]
  }
  return v
}

module.exports = (options = {}) => {
  return poi => {
    if (!poi.cli.isCurrentCommand('test')) return

    if (typeof options.extendWebpack === 'function') {
      poi.extendWebpack(options.extendWebpack)
    }

    const inferValue = (key, fallback) => {
      if (typeof poi.options[key] !== 'undefined') {
        return poi.options[key]
      }
      return fallback
    }

    let isTypeScript = false

    poi.extendWebpack(config => {
      const coverage = inferValue('coverage')

      isTypeScript = config.rules.has('typescript')

      if (coverage) {
        /* for general usage */
        const istanbulinstrumenterRule = config.rules.add(
          'istanbul-instrumenter',
          {
            test: /\.(jsx?)$/,
            exclude: [/(node_modules|\.test\.jsx?)/],
            enforce: 'pre'
          }
        )
        istanbulinstrumenterRule.loaders.add('istanbul-instrumenter-loader', {
          loader: 'istanbul-instrumenter-loader',
          options: {
            esModules: true
          }
        })

        /* for vue (assumes vue-loader) */
        const vueRule = config.rules.get('vue')
        vueRule.loaders.update('vue-loader', loader => {
          const instrumenterLoader =
            'istanbul-instrumenter-loader?esModules=true'
          loader.options.preLoaders = loader.options.preLoaders || {}
          loader.options.preLoaders.js =
            typeof loader.options.preLoaders.js === 'string'
              ? `${loader.options.preLoaders.js}!${instrumenterLoader}`
              : instrumenterLoader
          return loader
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

      const watch = inferValue('watch', false)
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
        typeof poi.options.karma === 'function'
          ? poi.options.karma(defaultConfig)
          : Object.assign({}, defaultConfig, poi.options.karma)
      karmaConfig.webpack = webpackConfig

      const server = new Server(karmaConfig)

      server.start()
    })
  }
}
