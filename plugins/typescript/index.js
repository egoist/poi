exports.name = 'typescript'

exports.apply = (
  api,
  {
    lintOnSave = true,
    configFile = 'tsconfig.json',
    babel: useBabel,
    loaderOptions,
    tscheckerOptions
  } = {}
) => {
  configFile = api.resolveCwd(configFile)

  api.hook('createWebpackChain', config => {
    const jsRule = config.module.rule('js')

    const test = jsRule.get('test').filter(re => {
      return !re.test('.ts') && !re.test('.tsx')
    })
    jsRule.test(test)

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

    if (useBabel) {
      const babelLoaderPath = jsRule.use('babel-loader').get('loader')
      const babelLoaderOptions = jsRule.use('babel-loader').get('options')
      rule
        .use('babel-loader')
        .loader(babelLoaderPath)
        .options(babelLoaderOptions)
    }

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
      .plugin('fork-ts-checker')
      .use(require('fork-ts-checker-webpack-plugin'), [
        Object.assign(
          {
            vue: true,
            formatter: 'codeframe',
            // https://github.com/TypeStrong/ts-loader#happypackmode-boolean-defaultfalse
            checkSyntacticErrors: api.config.parallel
          },
          tscheckerOptions,
          {
            tsconfig: configFile,
            tslint:
              lintOnSave &&
              Boolean(api.configLoader.resolve({ files: ['tslint.json'] }))
          }
        )
      ])
  })
}
