exports.name = 'builtin:config-eval'

exports.apply = api => {
  api.hook('createWebpackChain', config => {
    config.module
      .rule('eval')
      .test([/\.eval\.js$/, /\.eval\.ts$/])
      .type('json')
      .post()
      .use('eval-loader')
      .loader(require.resolve('../webpack/eval-loader'))
  })
}
