exports.name = 'builtin:config-reason'

exports.when = api => api.hasDependency('bs-platform')

exports.apply = api => {
  api.hook('createWebpackChain', config => {
    config.module
      .rule('reason')
      .test(/\.(re|ml)$/)
      .use('reason-loader')
      .loader(require.resolve('../webpack/reason-loader'))
      .options({
        watch: api.cli.options.serve || api.cli.options.watch
      })
  })
}
