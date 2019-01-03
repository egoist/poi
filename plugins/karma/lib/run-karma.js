const path = require('path')
const { Server } = require('karma')
const glob = require('fast-glob')

module.exports = async (api, testFiles, options) => {
  const webpackConfig = api.createWebpackChain()

  const cwd = api.resolveCwd()
  const files = await glob(
    [
      '!**/node_modules/**',
      `!${path.join(path.relative(process.cwd(), api.config.output.dir), '**')}`
    ].concat(testFiles),
    {
      cwd
    }
  )

  const config = {
    basePath: cwd,

    browsers: [options.headless ? 'PoiChromeHeadless' : 'PoiChrome'],

    customLaunchers: {
      PoiChrome: {
        base: 'Chrome'
      },
      PoiChromeHeadless: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },

    files: files.map(pattern => ({
      pattern,
      watched: false
    })),

    preprocessors: files.reduce((res, pattern) => {
      res[pattern] = ['webpack']
      return res
    }, {}),

    frameworks: ['jasmine'],

    reporters: ['mocha', options.coverage && 'coverage'].filter(Boolean),

    // Only used when --coverage
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        { type: 'text' },
        { type: 'html', subdir: 'report-html' },
        { type: 'lcov', subdir: 'report-lcov' }
      ]
    },

    webpack: webpackConfig.entryPoints
      .clear()
      .end()
      .toConfig(),

    webpackMiddleware: {
      logLevel: 'error',
      stats: 'errors-only',
      noInfo: true
    },

    colors: true,

    client: {
      captureConsole: true,

      jasmine: {
        random: false
      }
    },

    singleRun: !options.watch
  }

  const server = createServer(config, api.PoiError)

  server.start()

  await server.completion
}

function createServer(config, PoiError) {
  let resolve
  let reject

  // eslint-disable-next-line promise/param-names
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  const callback = code => {
    if (code === 0) return resolve()
    const err = new PoiError({
      message: `Karma has exited with code ${code}`
    })
    err.code = code
    reject(err)
  }

  const server = new Server(config, callback)

  server.completion = promise
  return server
}
