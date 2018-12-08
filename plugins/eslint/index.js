exports.name = 'eslint'

exports.apply = api => {
  api.hook('createWebpackChain', config => {
    const { cacheIdentifier } = api.getCacheConfig('eslint-loader', {}, [
      '.eslintrc.js',
      '.eslintrc.yaml',
      '.eslintrc.yml',
      '.eslintrc.json',
      '.eslintrc',
      'package.json'
    ])
    config.module
      .rule('eslint')
      .test([/\.jsx?$/, /\.vue$/])
      .pre()
      .exclude.add(filepath => /node_modules/.test(filepath))
      .end()
      .use('eslint-loader')
      .loader(require.resolve('eslint-loader'))
      .options({
        cache: api.config.cache,
        cacheKey: cacheIdentifier,
        formatter: require('eslint/lib/formatters/codeframe'),
        eslintPath: api.localResolve('eslint') || require.resolve('eslint')
      })
  })
}
