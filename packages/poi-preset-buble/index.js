const loaderPath = require.resolve('buble-loader')

module.exports = options => {
  options = Object.assign({
    transforms: {
      dangerousForOf: true,
      generator: false,
      modules: false
    },
    objectAssign: 'Object.assign'
  }, options)

  return poi => {
    const config = poi.webpackConfig

    for (const rule of ['js', 'es']) {
      config.module.rule(rule)
      .uses
        .delete('babel')
        .end()
      .use('buble')
        .loader(loaderPath)
        .options(options)
    }

    config.module.rule('vue')
      .use('vue')
      .tap(vueOptions => {
        vueOptions.loaders.js = {
          loader: loaderPath,
          options
        }
        return vueOptions
      })
  }
}
