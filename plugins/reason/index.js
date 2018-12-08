exports.name = 'reason'

exports.apply = api => {
  api.hook('createWebpackChain', config => {
    config.module
      .rule('bs')
      .test(/\.(re|ml)$/)
      .use('bs-loader')
      .loader(require.resolve('@poi/bs-loader'))
      .options({
        cwd: api.resolveCwd()
      })
  })
}
