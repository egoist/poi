const { GenerateSW } = require('workbox-webpack-plugin')

exports.extend = (api, options) => {
  const pluginOptions = Object.assign(
    {
      swDest: 'service-worker.js',
      navigateFallbackWhitelist: [/^(?!\/__).*/],
      navigateFallback: 'index.html',
      exclude: [
        /\.git/,
        /\.map$/,
        /\.DS_Store/,
        /^manifest.*\.js(?:on)?$/,
        /\.gz(ip)?$/,
        /\.br$/
      ]
    },
    options
  )

  if (api.isCommand('build')) {
    api.chainWebpack(config => {
      config.plugin('workbox').use(GenerateSW, [pluginOptions])
    })
  }

  if (api.isCommand('dev')) {
    api.configureDevSever(server => {
      server.use(require('skip-service-worker')(pluginOptions.swDest))
    })
  }
}
