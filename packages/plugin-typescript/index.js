/**
 * Add TypeScript support
 * @name pluginTypescript
 * @param {Object} options
 * @param {any} [options.loaderOptions=undefined] - Options for ts-loader.
 */
module.exports = ({ loaderOptions, tsChecker } = {}) => {
  return poi => {
    poi.chainWebpack(config => {
      const tsRule = config.module.rule('typescript').test(/\.tsx?$/)
      tsRule
        .use('ts-loader')
        .loader('ts-loader')
        .options(
          Object.assign(
            { appendTsSuffixTo: [/\.vue$/], transpileOnly: true },
            loaderOptions
          )
        )

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
            options: loaderOptions
          }
        ]
        return vueOptions
      })
    })
  }
}
