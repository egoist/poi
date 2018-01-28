/**
 * Add TypeScript support
 * @name pluginTypescript
 * @param {Object} options
 * @param {any} [options.loaderOptions=undefined] - Options for ts-loader.
 */
module.exports = ({
  loaderOptions
} = {}) => {
  return poi => {
    poi.extendWebpack(config => {
      config.append('resolve.extensions', '.ts')
      config.append('resolve.extensions', '.tsx')

      const tsRule = config.rules.add('typescript', {
        test: /\.tsx?$/
      })
      tsRule.loaders.add('ts-loader', {
        loader: 'ts-loader',
        options: Object.assign({ appendTsSuffixTo: [/\.vue$/] }, loaderOptions)
      })

      const vueRule = config.rules.get('vue')
      vueRule.loaders.update('vue-loader', vueOptions => {
        vueOptions.esModule = true
        vueOptions.loaders.ts = [{
          loader: 'ts-loader',
          options: loaderOptions
        }]
        return vueOptions
      })
    })
  }
}
