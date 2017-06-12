module.exports = ({
  loaderOptions
} = {}) => poi => {
  poi.extendWebpack(config => {
    config.module.rule('riot')
      .test(/\.tag$/)
      .use('riot-tag-loader')
      .loader('riot-tag-loader')
      .options(loaderOptions)
  })
}
