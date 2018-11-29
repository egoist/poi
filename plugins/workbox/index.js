const { GenerateSW } = require('workbox-webpack-plugin')

exports.name = 'workbox'

exports.apply = (api, { workboxOptions } = {}) => {
  const pluginOptions = Object.assign(
    {
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
    workboxOptions,
    {
      swDest: 'service-worker.js'
    }
  )

  if (api.mode === 'production') {
    api.hook('onCreateWebpackConfig', config => {
      // Only add for browser target
      if (api.config.output.target !== 'browser') return

      config.plugin('workbox').use(GenerateSW, [pluginOptions])
    })
  }
}
