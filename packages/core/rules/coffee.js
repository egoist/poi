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

  // prettier-ignore
  config.module
    .rule('vue')
      .use('vue-loader')
      .tap(options => {
        options.loaders.coffee = options.loaders.coffeescript = [
          {
            loader: 'babel-loader',
            options: babelConfig
          },
          {
            loader: 'better-coffee-loader'
          }
        ]
        return options
      })
}
