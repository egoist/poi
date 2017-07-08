module.exports = (babiliOptions, overrides) => {
  return poi => {
    poi.extendWebpack('production', config => {
      // Say goodbye to uglify plugin
      const BabiliPlugin = require('babili-webpack-plugin')

      config.plugin('minimize')
        .use(BabiliPlugin, [babiliOptions, overrides])
    })
  }
}
