const fs = require('fs')
const path = require('path')

module.exports = (options = {}) => {
  return poi => {
    const localCompiler = path.join(process.cwd(), 'node_modules/.bin/elm-make')
    const loaderOptions = Object.assign({
      // Only use local compiler when it exists
      pathToMake: fs.existsSync(localCompiler) ? localCompiler : null,
      warn: true,
      debug: poi.options.mode !== 'production'
    }, options.loaderOptions)

    poi.extendWebpack(config => {
      config.module
        .rule('elm')
          .test(/\.elm$/)
          .exclude
            .add(/elm-stuff/)
            .add(/node_modules/)
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
