const path = require('path')
const WebpackMonitor = require('webpack-monitor')

module.exports = ({ pluginOptions } = {}) => {
  return {
    name: 'webpack-monitor',
    command: 'build',
    apply(poi) {
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
}
