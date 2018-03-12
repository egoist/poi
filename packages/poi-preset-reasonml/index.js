/**
 * Add ReasonML support
 * @name presetReasonML
 * @param {Object} options
 * @param {any} [options.loaderOptions=undefined] - Options for bs-loader.
 */
module.exports = ({ loaderOptions } = {}) => {
  return poi => {
    poi.extendWebpack(config => {
      config.resolve.extensions
        .add('.re')
        .add('.ml')

      config.module
        .rule('reasonml')
          .test(/\.(re|ml)$/)
          .exclude
            .add(/node_modules/)
            .end()
          .use('bs-loader')
            .loader('bs-loader')
            .options(loaderOptions)
            .end()
          .end()
    })
  }
}
