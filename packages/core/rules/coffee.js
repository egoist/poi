module.exports = (config, { config: babelConfig }) => {
  // prettier-ignore
  config.module
    .rule('coffee')
    .test(/\.coffee$/)
    .exclude
      .add(/node_modules/)
      .end()
    .use('babel-loader')
      .loader('babel-loader')
      .options(babelConfig)
      .end()
    .use('coffee-loader')
      .loader('better-coffee-loader')

  config.resolve.extensions.add('.coffee')
}
