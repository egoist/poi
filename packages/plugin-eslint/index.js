module.exports = function({ loaderOptions, command = 'build' } = {}) {
  return {
    name: 'eslint',
    command,
    apply(poi) {
      poi.chainWebpack(config => {
        config.module
          .rule('eslint')
          .test(/\.(js|jsx|vue)$/)
          .exclude.add(/node_modules/)
          .end()
          .enforce('pre')
          .use('eslint-loader')
          .loader('eslint-loader')
          .options(loaderOptions)
      })
    }
  }
}
