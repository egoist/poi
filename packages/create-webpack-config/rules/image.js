module.exports = (config, filename) => {
  const imageRule = config.rules.add('image', {
    test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/]
  })
  imageRule.loaders.add('url-loader', {
    loader: 'url-loader',
    options: {
      name: filename.images
      // inline the file if < max size
      // limit: inlineImageMaxSize
    }
  })

  const svgRule = config.rules.add('svg', {
    test: /\.(svg)(\?.*)?$/
  })
  svgRule.loaders.add('file-loader', {
    // SVG files use file-loader directly, why?
    // See https://github.com/facebookincubator/create-react-app/pull/1180
    loader: 'file-loader',
    options: {
      name: filename.images
    }
  })
}
