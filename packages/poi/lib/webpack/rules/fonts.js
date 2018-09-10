module.exports = (config, filename) => {
  config.module
    .rule('font')
    .test(/\.(eot|otf|ttf|woff|woff2)(\?.*)?$/)
    .use('file-loader')
    .loader('file-loader')
    .options({
      name: filename
    })
}
