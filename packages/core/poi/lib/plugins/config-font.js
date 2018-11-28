exports.name = 'builtin:config-font'

exports.apply = api => {
  api.hook('onCreateWebpackConfig', config => {
    config.module
      .rule('font')
      .test(/\.(eot|otf|ttf|woff|woff2)(\?.*)?$/)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: api.config.output.fileNames.font
      })
  })
}
