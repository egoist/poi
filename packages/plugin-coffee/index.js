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

      const jsRule = config.module.rule('js')
      if (jsRule.uses.has('babel-loader')) {
        babelOptions = Object.assign(
          {},
          jsRule.use('babel-loader').get('options')
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

      config.module
        .rule('coffee')
        .test(/\.coffee$/)
        .use('coffee-loader')
        .loader('better-coffee-loader')
        .options(coffeeOptions)

      config.resolve.extensions.add('.coffee')

      config.module
        .rule('vue')
        .use('vue-loader')
        .tap(options => {
          options.loaders.coffee = options.loaders.coffeescript = [
            {
              loader: 'better-coffee-loader',
              options: coffeeOptions
            }
          ]
          return options
        })
    })
  }
}
