exports.name = 'builtin:config-dev'

exports.extend = api => {
  if (!api.isCommand('dev')) return
  api.chainWebpack(config => {
    if (config.entryPoints.has('index')) {
      config
        .entry('index')
        .prepend(require.resolve('@poi/dev-utils/hotDevClient'))
    }

    if (api.config.devServer.hot !== false) {
      const { HotModuleReplacementPlugin } = require('webpack')
      HotModuleReplacementPlugin.__expression = `require('webpack').HotModuleReplacementPlugin`

      config.plugin('hmr').use(HotModuleReplacementPlugin)
    }
  })
}
