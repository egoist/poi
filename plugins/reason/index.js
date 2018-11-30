exports.name = 'reason'

exports.apply = api => {
  api.hook('onCreateWebpackConfig', config => {
    config.module
      .rule('bs')
      .test(/\.(re|ml)$/)
      .use('bs-loader')
      .loader(require.resolve('@poi/bs-loader'))
      .options({
        cwd: api.resolve()
      })
  })
}
