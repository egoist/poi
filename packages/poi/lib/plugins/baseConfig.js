const isCI = require('is-ci')
const createWebpackConfig = require('@poi/create-webpack-config')

module.exports = poi => {
  poi.extendWebpack(config => {
    const { host, port, clearScreen } = poi.options

    config.plugins.add('fancy-log', require('../webpack/FancyLogPlugin'), [
      {
        command: poi.command,
        host,
        port,
        clearScreen
      }
    ])

    if (
      process.stderr.isTTY &&
      process.env.NODE_ENV !== 'test' &&
      poi.options.progress !== false &&
      !isCI
    ) {
      config.plugins.add('progress-bar', require('../webpack/ProgressPlugin'))
    }
  })

  createWebpackConfig(poi)
}
