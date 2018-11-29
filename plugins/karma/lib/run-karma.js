const { Server } = require('karma')

module.exports = (api, testFiles, options) => {
  const webpackConfig = api.createWebpackConfig()

  const config = {
    basePath: api.cwd,

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

    files: testFiles.map(pattern => ({
      pattern,
      watched: false
    })),

    exclude: ['!**/node_modules/**', '!**/dist/**', '!**/vendor/**'],

    preprocessors: testFiles.reduce((res, pattern) => {
      res[pattern] = ['webpack']
      return res
    }, {}),

    frameworks: ['jasmine'],

    webpack: webpackConfig.entryPoints
      .clear()
      .end()
      .toConfig(),

    webpackMiddleware: {
      noInfo: true,
      stats: 'errors-only'
    },

    colors: true,

    client: {
      captureConsole: true,

      jasmine: {
        random: false
      }
    }
  }

  if (!options.watch) config.singleRun = true

  const server = createServer(config, api.PoiError)

  server.start()

  return server.completion
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
