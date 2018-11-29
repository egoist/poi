const { GenerateSW } = require('workbox-webpack-plugin')

exports.name = 'workbox'

exports.apply = (api, { workboxOptions, manifest = true } = {}) => {
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

      if (manifest) {
        config
          .plugin('workbox-manifest')
          .use(require('pwa-manifest-plugin'), [])
      }
    })
  }
}
