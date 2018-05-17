module.exports = ({ loaderOptions } = {}) => {
  return {
    name: 'riot',
    apply(poi) {
      poi.chainWebpack(config => {
        config.module
          .rule('riot')
          .test(/\.tag$/)
          .use('riot-tag-loader')
          .loader('riot-tag-loader')
          .options(loaderOptions)
      })
    }
  }
}
