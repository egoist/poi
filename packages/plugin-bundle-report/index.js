/**
 * @name pluginBundleReport
 * @param {Object} [pluginOptions=undefined] - Options for
 * {@link https://github.com/th0r/webpack-bundle-analyzer webpack-bundle-analyzer} plugin
 */
module.exports = pluginOptions => {
  return {
    name: 'bundle-report',
    command: 'build',
    apply(poi) {
      poi.chainWebpack(config => {
        if (poi.options.bundleReport) {
          const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

          config
            .plugin('bundle-report')
            .use(BundleAnalyzerPlugin, [pluginOptions])
        }
      })
    }
  }
}
