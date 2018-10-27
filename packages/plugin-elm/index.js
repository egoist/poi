exports.name = 'elm'

exports.apply = (api, options = {}) => {
  api.chainWebpack(config => {
    const loaderOptions = Object.assign(
      {
        warn: true,
        debug: api.mode !== 'production'
      },
      options.loaderOptions
    )

    config.module
      .rule('elm')
      .test(/\.elm$/)
      .exclude.add(/elm-stuff/)
      .add(/node_modules/)
      .end()
      .use('elm-webpack-loader')
      .loader('elm-wbepack-loader')
      .options(loaderOptions)
  })
}
