/**
 * @name pluginBundleReport
 * @param {Object} [pluginOptions=undefined] - Options for
 * {@link https://github.com/th0r/webpack-bundle-analyzer webpack-bundle-analyzer} plugin
 */
module.exports = pluginOptions => {
  return poi => {
    if (!poi.cli.isCurrentCommand('build')) return

    poi.extendWebpack(config => {
      if (poi.options.bundleReport) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

        config
          .plugin('bundle-report')
          .use(BundleAnalyzerPlugin, [pluginOptions])
      }
    })
  }
}
