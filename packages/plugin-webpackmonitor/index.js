const path = require('path')
const WebpackMonitor = require('webpack-monitor')

module.exports = ({ pluginOptions } = {}) => {
  return poi => {
    if (!poi.cli.isCurrentCommand('build')) return

    poi.chainWebpack(config => {
      config.plugin('webpackmonitor').use(WebpackMonitor, [
        Object.assign(
          {
            target: path.resolve('.monitor/stats.json'),
            launch: poi.argv.webpackmonitor
          },
          pluginOptions
        )
      ])
    })
  }
}
