module.exports = (options = {}) => {
  return poi => {
    const loaderOptions = Object.assign({
      pathToMake: 'node_modules/.bin/elm-make',
      warn: true,
      debug: poi.options.mode !== 'production'
    }, options.loaderOptions)

    poi.extendWebpack(config => {
      config.module
        .rule('elm')
          .test(/\.elm$/)
          .exclude
            .add([/elm-stuff/, /node_modules/])
            .end()
          .use('elm-hot')
            .loader('elm-hot-loader')
            .end()
          .use('elm-webpack')
            .loader('elm-webpack-loader')
            .options(loaderOptions)
            .end()
          .end()
    })
  }
}
