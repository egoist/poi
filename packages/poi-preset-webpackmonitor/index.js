const path = require('path')
const WebpackMonitor = require('webpack-monitor')

module.exports = ({ pluginOptions } = {}) => {
  return poi => {
    poi.extendWebpack('production', config => {
      config.plugins.add('webpackmonitor', WebpackMonitor, [Object.assign({
        target: path.resolve('.monitor/stats.json'),
        launch: poi.argv.webpackmonitor
      }, pluginOptions)])
    })
  }
}
