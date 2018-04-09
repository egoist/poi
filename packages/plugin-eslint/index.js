module.exports = function({ loaderOptions, command = 'build' } = {}) {
  return poi => {
    if (!poi.cli.isCurrentCommand(command)) return

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
