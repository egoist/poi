const fs = require('fs')

module.exports = (options = {}) => {
  return poi => {
    const localCompiler = 'node_modules/.bin/elm-make'
    const loaderOptions = Object.assign({
      // Only use local compiler when it exists
      pathToMake: fs.existsSync(localCompiler) ? localCompiler : null,
      warn: true,
      debug: poi.options.mode !== 'production'
    }, options.loaderOptions)

    poi.extendWebpack(config => {
      const elmRule = config.rules
        .add('elm', {
          test: /\.elm$/,
          exclude: [
            /elm-stuff/,
            /node_modules/
          ]
        })

      elmRule.loaders.add('elm-hot-loader', {
        loader: 'elm-hot-loader'
      })

      elmRule.loaders.add('elm-webpack', {
        loader: 'elm-webpack-loader',
        options: loaderOptions
      })
    })
  }
}
