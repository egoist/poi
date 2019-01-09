exports.name = 'builtin:config-font'

exports.apply = api => {
  api.hook('createWebpackChain', config => {
    config.module
      .rule('font')
      .test(/\.(eot|otf|ttf|woff|woff2)(\?.*)?$/)
      .use('file-loader')
      .loader(require.resolve('file-loader'))
      .options({
        name: api.config.output.fileNames.font
      })
  })
}
