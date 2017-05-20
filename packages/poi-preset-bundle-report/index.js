const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

/**
 * @name presetBundleReport
 * @param {Object} [pluginOptions=undefined] - Options for {@link https://github.com/th0r/webpack-bundle-analyzer webpack-bundle-analyzer} plugin
 */
module.exports = pluginOptions => {
  return poi => {
    poi.mode('production', () => {
      poi.webpackConfig
        .plugin('bundle-report')
        .use(BundleAnalyzerPlugin, [pluginOptions])
    })
  }
}
