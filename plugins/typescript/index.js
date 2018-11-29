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

    if (api.config.cache) {
      rule
        .use('cache-loader')
        .loader('cache-loader')
        .options(
          api.getCacheConfig(
            'ts-loader',
            {
              typescript: require('typescript/package').version,
              'ts-loader': require('ts-loader/package').version
            },
            'tsconfig.json'
          )
        )
    }

    if (api.config.parallel) {
      rule.use('thread-loader').loader('thread-loader')
    }

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
