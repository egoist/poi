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

      for (const rule of ['js', 'es']) {
        const thisRule = config.rules.get(rule)
        // Remove babel-loader first
        thisRule.loaders.remove('babel-loader')

        // Maybe add nodent-loader
        if (asyncAwait) {
          thisRule.loaders.add('nodent-loader', {
            loader: require.resolve('./nodent-loader')
          })
        }

        // Add buble-loader
        thisRule.loaders.add('buble-loader', {
          loader: require.resolve('./buble-loader'),
          options: bubleOptions
        })
      }

      const vueRule = config.rules.get('vue')
      vueRule.loaders.update('vue-loader', vueOptions => {
        vueOptions.loaders.js = {
          loader: require.resolve('./buble-loader'),
          options: bubleOptions
        }
        if (asyncAwait) {
          vueOptions.loaders.js = [
            {
              loader: require.resolve('./nodent-loader')
            },
            vueOptions.loaders.js
          ]
        }
        return vueOptions
      })
    })
  }
}
