const merge = require('lodash.merge')

module.exports = (config, cliConfig) => {
  const devServer = merge({}, config.devServer, cliConfig.devServer, {
    proxy: []
      .concat((config.devServer && config.devServer.proxy) || [])
      .concat(cliConfig.devServer.proxy || [])
  })
  return merge({}, config, cliConfig, {
    devServer
  })
}
