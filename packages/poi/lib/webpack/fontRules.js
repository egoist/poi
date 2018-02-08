module.exports = (config, filename) => {
  const fontRule = config.rules.add('font', {
    test: /\.(eot|otf|webp|ttf|woff|woff2)(\?.*)?$/
  })
  fontRule.loaders.add('file-loader', {
    loader: 'file-loader',
    options: {
      name: filename.fonts
    }
  })
}
