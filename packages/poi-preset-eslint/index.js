module.exports = function (options) {
  return poi => {
    poi.webpackConfig.module.rule('eslint')
      .test(/\.(js|jsx|vue)$/)
      .exclude
        .add(/node_modules/)
        .end()
      .pre()
      .use('eslint')
        .loader('eslint-loader')
        .options(options)
  }
}
