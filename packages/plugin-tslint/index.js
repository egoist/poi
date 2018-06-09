module.exports = function({ loaderOptions, command = 'build' } = {}) {
  return {
    name: 'tslint',
    command,
    apply(poi) {
      poi.chainWebpack(config => {
        config.module
          .rule('tslint')
          .test(/\.(ts|tsx)$/)
          .exclude.add(/node_modules/)
          .end()
          .enforce('pre')
          .use('tslint-loader')
          .loader('tslint-loader')
          .options(loaderOptions)
      })
    }
  }
}
