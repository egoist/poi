module.exports = config => {
  config.module
    .rule('vue')
    .test(/\.vue$/)
    .use('vue-loader')
    .loader(require.resolve('vue-loader'))

  config.plugin('vue').use(require('vue-loader').VueLoaderPlugin)
}
