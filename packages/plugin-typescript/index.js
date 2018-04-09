/**
 * Add TypeScript support
 * @name pluginTypescript
 * @param {Object} options
 * @param {any} [options.loaderOptions=undefined] - Options for ts-loader.
 */
module.exports = ({ loaderOptions } = {}) => {
  return poi => {
    poi.extendWebpack(config => {
      config.append('resolve.extensions', '.ts')
      config.append('resolve.extensions', '.tsx')

      const tsRule = config.module.rule('typescript').test(/\.tsx?$/)
      tsRule
        .use('ts-loader')
        .loader('ts-loader')
        .options(Object.assign({ appendTsSuffixTo: [/\.vue$/] }, loaderOptions))

      const vueRule = config.module.rule('vue')
      vueRule.use('vue-loader').tap(vueOptions => {
        vueOptions.esModule = true
        vueOptions.loaders.ts = [
          {
            loader: 'ts-loader',
            options: loaderOptions
          }
        ]
        return vueOptions
      })
    })
  }
}
