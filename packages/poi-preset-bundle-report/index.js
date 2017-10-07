const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

/**
 * @name presetBundleReport
 * @param {Object} [pluginOptions=undefined] - Options for
 * {@link https://github.com/th0r/webpack-bundle-analyzer webpack-bundle-analyzer} plugin
 */
module.exports = pluginOptions => {
  return poi => {
    poi.extendWebpack('production', config => {
      if (poi.argv.bundleReport) {
        config
          .plugin('bundle-report')
          .use(BundleAnalyzerPlugin, [pluginOptions])
      }
    })
  }
}
