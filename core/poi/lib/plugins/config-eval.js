exports.name = 'builtin:config-eval'

exports.apply = api => {
  api.hook('createWebpackChain', config => {
    config.module
      .rule('eval')
      .test(config.module.rule('js').get('test'))
      .include.add(filepath => {
        return /\.eval\.\w+$/.test(filepath)
      })
      .end()
      .type('json')
      .post()
      .use('eval-loader')
      .loader(require.resolve('../webpack/eval-loader'))
  })
}
