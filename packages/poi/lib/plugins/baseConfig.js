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
  })

  createWebpackConfig(poi)
}
