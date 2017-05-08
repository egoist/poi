const { Server } = require('karma')

module.exports = ({
  port = 5001,
  testFiles = ['test/unit/**/*.test.js'],
  testFrameworks = ['jasmine'],
  browsers = ['PhantomJS'],
  singleRun = process.env.CI
} = {}) => {
  return poi => {
    poi.mode('test', () => {
      if (!Array.isArray(testFiles)) {
        testFiles = [testFiles]
      }

      const karmaConfig = {
        port,
        browsers,
        frameworks: testFrameworks,
        basePath: process.cwd(),
        files: testFiles,
        reporters: ['spec'],
        preprocessors: testFiles.reduce((current, next) => {
          current[next] = ['webpack', 'sourcemap']
          return current
        }, {}),
        webpackMiddleware: {
          stats: 'errors-only',
          noInfo: true
        },
        singleRun // single-run mode in CI
      }

      const webpackConfig = poi.webpackConfig.toConfig()

      delete webpackConfig.entry
      karmaConfig.webpack = webpackConfig

      const server = new Server(karmaConfig)

      server.start()
    })
  }
}
