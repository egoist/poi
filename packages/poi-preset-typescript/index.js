/**
 * Add TypeScript support
 * @name presetTypescript
 * @param {Object} options
 * @param {any} [options.loaderOptions=undefined] - Options for ts-loader.
 */
module.exports = ({
  loaderOptions
} = {}) => {
  return poi => {
    const config = poi.webpackConfig

    config.resolve.extensions
      .add('.ts')
      .add('.tsx')

    config.module.rule('typescript')
      .test(/\.tsx?$/)
      .use('ts-loader')
        .loader(require.resolve('ts-loader'))
        .options(Object.assign({ appendTsSuffixTo: [/\.vue$/] }, loaderOptions))

    config.module.rule('vue')
      .use('vue-loader')
        .tap(vueOptions => {
          vueOptions.esModule = true
          vueOptions.loaders.ts = [{
            loader: require.resolve('ts-loader'),
            options: loaderOptions
          }]
          return vueOptions
        })
  }
}
