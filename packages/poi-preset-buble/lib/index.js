/**
 * Use Buble to transpile JS files
 * @name presetBuble
 * @param {Object} options
 * @param {Boolean} [options.asyncAwait=true] - Enable async/await support via nodent
 * @param {Object} options.bubleOptions - Options for buble.
 * If this option is set, it will be assigned to default buble options.
 */
module.exports = ({
  asyncAwait = true,
  bubleOptions
} = {}) => {
  return poi => {
    poi.extendWebpack(config => {
      bubleOptions = Object.assign({
        transforms: {
          dangerousForOf: true,
          generator: false,
          modules: false
        },
        objectAssign: 'Object.assign'
      }, bubleOptions)

      for (const rule of ['js', 'es']) {
        const thisRule = config.module.rule(rule)
        // Remove babel-loader first
        thisRule.uses
          .delete('babel-loader')
          .end()

        // Maybe add nodent-loader
        if (asyncAwait) {
          thisRule
          .use('nodent')
            .loader(require.resolve('./nodent-loader'))
        }

        // Add buble-loader
        thisRule
        .use('buble-loader')
          .loader(require.resolve('./buble-loader'))
          .options(bubleOptions)
      }

      config.module.rule('vue')
        .use('vue-loader')
        .tap(vueOptions => {
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
