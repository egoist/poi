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
        .options(options)

    // Vue support is not working properly now
    config.module.rule('vue')
      .use('vue')
        .tap(vueOptions => {
          vueOptions.loaders.ts = [{
            loader: require.resolve('ts-loader'),
            options
          }]
          return vueOptions
        })
  }
}
