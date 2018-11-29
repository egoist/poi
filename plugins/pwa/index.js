const { GenerateSW } = require('workbox-webpack-plugin')

exports.name = 'pwa'

exports.apply = (api, options = {}) => {
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
    options.workboxOptions,
    {
      swDest: 'service-worker.js'
    }
  )

  api.hook('onCreateWebpackConfig', config => {
    // Only add for browser target
    if (api.config.output.target !== 'browser') return

    if (api.mode === 'production') {
      config.plugin('workbox').use(GenerateSW, [pluginOptions])
    }

    // Copy the public/manifest.json to dist/manifest.json
    // Since in `--serve` public folder are not copied but directly served as static assets
    if (!config.plugins.has('copy-public-folder')) {
      config.plugin('copy-manifest-json').use(api.webpackUtils.CopyPlugin, [
        [
          {
            // Pretend to be a glob pattern
            // TODO: newly added manifest.json won't trigger copy
            from: api.resolveCwd('public/{manifest,manifest}.json'),
            to: '[name].[ext]',
            toType: 'template'
          }
        ]
      ])
    }

    // Inject PWA tags in HTML
    // Generate / tpdate manifest.json
    config.plugin('pwa-html').use(require('pwa-html-webpack-plugin'), [options])
  })
}
