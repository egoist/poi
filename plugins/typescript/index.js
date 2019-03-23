exports.name = 'typescript'

exports.apply = (
  api,
  { lintOnSave = true, configFile = 'tsconfig.json', loaderOptions } = {}
) => {
  configFile = api.resolveCwd(configFile)

  api.hook('createWebpackChain', config => {
    const test = config.module
      .rule('js')
      .get('test')
      .filter(re => {
        return !re.test('.ts') && !re.test('.tsx')
      })
    config.module.rule('js').test(test)

    const rule = config.module.rule('ts').test(/\.tsx?$/)

    api.webpackUtils.addCacheSupport(rule, () =>
      api.getCacheConfig(
        'ts-loader',
        {
          typescript: api.localRequire('typescript/package').version,
          'ts-loader': require('ts-loader/package').version
        },
        configFile
      )
    )

    api.webpackUtils.addParallelSupport(rule)

    rule
      .use('ts-loader')
      .loader(require.resolve('ts-loader'))
      .options(
        Object.assign(
          {
            transpileOnly: true,
            appendTsSuffixTo: ['\\.vue$'],
            // https://github.com/TypeStrong/ts-loader#happypackmode-boolean-defaultfalse
            happyPackMode: api.config.parallel
          },
          loaderOptions,
          {
            configFile
          },
          require('ts-pnp')
        )
      )

    config
      .plugin('fork-ts-cheker')
      .use(require('fork-ts-checker-webpack-plugin'), [
        {
          vue: true,
          tsconfig: configFile,
          tslint:
            lintOnSave &&
            Boolean(api.configLoader.resolve({ files: ['tslint.json'] })),
          formatter: 'codeframe',
          // https://github.com/TypeStrong/ts-loader#happypackmode-boolean-defaultfalse
          checkSyntacticErrors: api.config.parallel
        }
      ])
  })
}
