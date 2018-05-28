/**
 * Use Buble to transpile JS files
 * @name pluginBuble
 * @param {Object} options
 * @param {Boolean} [options.asyncAwait=true] - Enable async/await support via nodent
 * @param {Object} options.bubleOptions - Options for buble.
 * If this option is set, it will be assigned to default buble options.
 */
module.exports = ({ asyncAwait = true, bubleOptions } = {}) => {
  return {
    name: 'buble',
    apply(poi) {
      poi.chainWebpack(config => {
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

        const jsRule = config.module.rule('js')

        // Add buble-loader
        jsRule
          .use('buble-loader')
          .loader(require.resolve('./buble-loader'))
          .options(bubleOptions)
          .after('babel-loader')

        // Remove babel-loader
        jsRule.uses.delete('babel-loader')

        // Maybe add nodent-loader
        if (asyncAwait) {
          jsRule
            .use('nodent-loader')
            .loader(require.resolve('./nodent-loader'))
            .before('buble-loader')
        }
      })
    }
  }
}
