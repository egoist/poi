exports.name = 'typescript'

exports.apply = api => {
  api.hook('onCreateWebpackConfig', config => {
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
        'tsconfig.json'
      )
    )

    api.webpackUtils.addParallelSupport(rule)

    rule
      .use('ts-loader')
      .loader('ts-loader')
      .options({
        transpileOnly: true,
        appendTsSuffixTo: ['\\.vue$'],
        // https://github.com/TypeStrong/ts-loader#happypackmode-boolean-defaultfalse
        happyPackMode: api.config.parallel
      })

    config
      .plugin('fork-ts-cheker')
      .use(require('fork-ts-checker-webpack-plugin'), [
        {
          vue: true,
          tslint: Boolean(api.configLoader.resolve({ files: ['tslint.json'] })),
          formatter: 'codeframe',
          // https://github.com/TypeStrong/ts-loader#happypackmode-boolean-defaultfalse
          checkSyntacticErrors: api.config.parallel
        }
      ])
  })
}
