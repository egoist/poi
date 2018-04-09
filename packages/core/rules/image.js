module.exports = (config, { filename, inlineImageMaxSize = 10000 }) => {
  config.module
    .rule('image')
    .test([/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/])
    .use('url-loader')
    .loader('url-loader')
    .options({
      name: filename.images,
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
      name: filename.images
    })
}
