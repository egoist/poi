module.exports = (pluginOptions, overrides) => {
  return poi => {
    poi.extendWebpack('production', config => {
      // Say goodbye to uglify plugin
      const BabelMinifyPlugin = require('babel-minify-webpack-plugin')

      // do not use if `minimize` is off
      if (config.plugins.has('minimize')) {
        config.plugins.update('minimize', BabelMinifyPlugin, [pluginOptions, overrides])
      }
    })
  }
}
