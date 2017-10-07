/**
 * Add CoffeeScript support
 * @name presetCoffeescript
 * @param {Object} options
 * @param {any} [options.loaderOptions={transpile: babelOptions}] - Options for {@link https://github.com/webpack-contrib/coffee-loader#options coffee-loader}, `babelOptions` defaults to the babel-loader options we use against `.js` files.
 */
module.exports = ({ loaderOptions } = {}) => {
  return poi => {
    poi.extendWebpack(config => {
      const babelOptions = config.module.rule('js')
        .use('babel-loader')
        .store
        .get('options')

      const coffeeOptions = Object.assign({
        transpile: babelOptions
      }, loaderOptions)

      config.module.rule('coffee')
        .test(/\.coffee$/)
        .use('coffee-loader')
          .loader('coffee-loader')
          .options(coffeeOptions)

      config.module.rule('vue')
        .use('vue-loader')
          .tap(vueOptions => {
            vueOptions.loaders.coffee = vueOptions.loaders.coffeescript = [{
              loader: 'coffee-loader',
              options: coffeeOptions
            }]
            return vueOptions
          })
    })
  }
}
