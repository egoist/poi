module.exports = function (options) {
  return poi => {
    const config = poi.webpackConfig

    config.resolve.extensions
      .add('.ts')
      .add('.tsx')

    config.module.rule('typescript')
      .test(/\.tsx?$/)
      .use('ts')
        .loader(require.resolve('ts-loader'))
        .options(Object.assign({ appendTsSuffixTo: [/\.vue$/] }, options))

    config.module.rule('vue')
      .use('vue')
        .tap(vueOptions => {
          vueOptions.esModule = true
          vueOptions.loaders.ts = [{
            loader: require.resolve('ts-loader'),
            options
          }]
          return vueOptions
        })
  }
}
