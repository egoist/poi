const loaderPath = require.resolve('buble-loader')

/**
 * Use Buble to transpile JS files
 * @name presetBuble
 * @param {Object} options
 * @param {Object} options.loaderOptions - Options for buble-loader.
 * If this option is preset, it will be assigned to default buble options.
 */
module.exports = ({
  loaderOptions
} = {}) => {
  return poi => {
    loaderOptions = Object.assign({
      transforms: {
        dangerousForOf: true,
        generator: false,
        modules: false
      },
      objectAssign: 'Object.assign'
    }, loaderOptions)

    const config = poi.webpackConfig

    for (const rule of ['js', 'es']) {
      config.module.rule(rule)
      .uses
        .delete('babel-loader')
        .end()
      .use('buble-loader')
        .loader(loaderPath)
        .options(loaderOptions)
    }

    config.module.rule('vue')
      .use('vue-loader')
      .tap(vueOptions => {
        vueOptions.loaders.js = {
          loader: loaderPath,
          options: loaderOptions
        }
        return vueOptions
      })
  }
}
