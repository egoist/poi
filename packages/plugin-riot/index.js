module.exports = ({ loaderOptions } = {}) => poi => {
  poi.extendWebpack(config => {
    const riotRule = config.rules.add('riot', {
      test: /\.tag$/
    })
    riotRule.loaders.add('riot-tag-loader', {
      loader: 'riot-tag-loader',
      options: loaderOptions
    })
  })
}
