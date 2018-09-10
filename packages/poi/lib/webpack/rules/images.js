module.exports = (config, filename) => {
  const inlineImageMaxSize = 5000 // 5 KB

  config.module
    .rule('image')
    .test([/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.webp$/])
    .use('url-loader')
    .loader('url-loader')
    .options({
      name: filename,
      // inline the file if < max size
      limit: inlineImageMaxSize
    })

  config.module
    .rule('svg')
    .test(/\.(svg)(\?.*)?$/)
    .use('file-loader')
    // SVG files use file-loader directly, why?
    // See https://github.com/facebookincubator/create-react-app/pull/1180
    .loader('file-loader')
    .options({
      name: filename
    })
}
