module.exports = (pluginOptions, overrides) => {
  return poi => {
    poi.extendWebpack('production', config => {
      // Say goodbye to uglify plugin
      const BabelMinifyPlugin = require('babel-minify-webpack-plugin')

      config.plugin('minimize')
        .use(BabelMinifyPlugin, [pluginOptions, overrides])
    })
  }
}
