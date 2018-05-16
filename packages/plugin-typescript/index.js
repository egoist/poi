/**
 * Add TypeScript support
 * @name pluginTypescript
 * @param {Object} options
 * @param {any} [options.loaderOptions=undefined] - Options for ts-loader.
 * @param {any} [options.tsChecker=undefined] - Options for fork-ts-checker.
 */
module.exports = ({ loaderOptions, tsChecker } = {}) => {
  const tsLoaderOptions = Object.assign(
    {
      appendTsSuffixTo: [/\.vue$/],
      transpileOnly: true 
    },
    loaderOptions
  )

  return poi => {
    poi.chainWebpack(config => {
      const tsRule = config.module.rule('typescript').test(/\.tsx?$/)
      tsRule
        .use('ts-loader')
        .loader('ts-loader')
        .options(tsLoaderOptions)

      config.resolve.extensions.add('.ts').add('.tsx')

      config
        .plugin('fork-ts-checker')
        .use(require('fork-ts-checker-webpack-plugin'), [
          Object.assign(
            {
              vue: config.module.rules.has('vue')
            },
            tsChecker
          )
        ])

      config.resolve
        .plugin('tsconfig-paths')
        .use(require('tsconfig-paths-webpack-plugin'))

      const vueRule = config.module.rule('vue')
      vueRule.use('vue-loader').tap(vueOptions => {
        vueOptions.esModule = true
        vueOptions.loaders.ts = [
          {
            loader: 'ts-loader',
            options: tsLoaderOptions
          }
        ]
        return vueOptions
      })
    })
  }
}
