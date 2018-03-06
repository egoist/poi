/**
 * Use Buble to transpile JS files
 * @name pluginBuble
 * @param {Object} options
 * @param {Boolean} [options.asyncAwait=true] - Enable async/await support via nodent
 * @param {Object} options.bubleOptions - Options for buble.
 * If this option is set, it will be assigned to default buble options.
 */
module.exports = ({ asyncAwait = true, bubleOptions } = {}) => {
  return poi => {
    poi.extendWebpack(config => {
      bubleOptions = Object.assign(
        {
          transforms: {
            dangerousForOf: true,
            generator: false,
            modules: false
          },
          objectAssign: 'Object.assign'
        },
        bubleOptions
      )

      const jsRule = config.rules.get('js')
      // Remove babel-loader first
      jsRule.loaders.delete('babel-loader')

      // Maybe add nodent-loader
      if (asyncAwait) {
        jsRule.loaders.add('nodent-loader', {
          loader: require.resolve('./nodent-loader')
        })
      }

      // Add buble-loader
      jsRule.loaders.add('buble-loader', {
        loader: require.resolve('./buble-loader'),
        options: bubleOptions
      })

      const vueRule = config.rules.get('vue')
      vueRule.loaders.update('vue-loader', loader => {
        loader.options.loaders.js = {
          loader: require.resolve('./buble-loader'),
          options: bubleOptions
        }
        if (asyncAwait) {
          loader.options.loaders.js = [
            {
              loader: require.resolve('./nodent-loader')
            },
            loader.options.loaders.js
          ]
        }
        return loader
      })
    })
  }
}
