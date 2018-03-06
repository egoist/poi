/**
 * Add CoffeeScript support
 * @name pluginCoffeescript
 * @param {Object} options
 * @param {any} [options.loaderOptions={transpile: babelOptions}] - Options for
 * {@link https://github.com/egoist/better-coffee-loader#options}, `babelOptions` defaults to the babel-loader options we use against `.js` files.
 */
module.exports = ({ loaderOptions } = {}) => {
  return poi => {
    poi.extendWebpack(config => {
      let babelOptions

      const jsRule = config.rules.get('js')
      if (jsRule.loaders.has('babel-loader')) {
        babelOptions = Object.assign(
          {},
          jsRule.loaders.get('babel-loader').options.options
        )
        // Delete unnecessary loader-specific options
        delete babelOptions.cacheDirectory
        delete babelOptions.cacheIdentifier
        delete babelOptions.forceEnv
      }

      const coffeeOptions = Object.assign(
        {
          transpile: babelOptions
        },
        loaderOptions
      )

      config.rules
        .add('coffee', {
          test: /\.coffee$/
        })
        .loaders.add('coffee-loader', {
          loader: 'better-coffee-loader',
          options: coffeeOptions
        })

      config.append('resolve.extensions', '.coffee')

      config.rules.get('vue').loaders.update('vue-loader', loader => {
        loader.options.loaders.coffee = loader.options.loaders.coffeescript = [
          {
            loader: 'better-coffee-loader',
            options: coffeeOptions
          }
        ]
        return loader
      })
    })
  }
}
