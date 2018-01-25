/**
 * Add CoffeeScript support
 * @name presetCoffeescript
 * @param {Object} options
 * @param {any} [options.loaderOptions={transpile: babelOptions}] - Options for
 * {@link https://github.com/webpack-contrib/coffee-loader#options coffee-loader}, `babelOptions` defaults to the babel-loader options we use against `.js` files.
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

      const coffeeOptions = Object.assign({
        transpile: babelOptions
      }, loaderOptions)

      config.rules.add('coffee', {
        test: /\.coffee$/
      }).loaders.add('coffee-loader', {
        loader: 'better-coffee-loader',
        options: coffeeOptions
      })

      config.rules.get('vue')
        .loaders.update('vue-loader', vueOptions => {
          vueOptions.loaders.coffee = vueOptions.loaders.coffeescript = [{
            loader: 'better-coffee-loader',
            options: coffeeOptions
          }]
          return vueOptions
        })
    })
  }
}
