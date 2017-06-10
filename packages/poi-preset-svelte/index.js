/**
 * Add Svelte support
 * @name presetSvelte
 * @param {Object} options
 * @param {any} [options.loaderOptions=undefined] - Options for svelte-loader.
 */
module.exports = function ({
  loaderOptions
} = {}) {
  return poi => {
    poi.extendWebpack(config => {
      config.resolve
        .extensions
        .add('.html')

      const jsRule = config.module.rule('js')
      const isBabel = jsRule.uses.has('babel-loader')
      const isBuble = jsRule.uses.has('buble-loader')

      let jsLoaderOptions
      if (isBabel || isBuble) {
        jsLoaderOptions = config.module
          .rule('js')
            .use(isBabel ? 'babel-loader' : 'buble-loader')
              .store.get('options')
      }

      let jsLoaderPath
      let jsLoaderName
      if (isBabel) {
        jsLoaderName = 'babel-loader'
        jsLoaderPath = 'babel-loader'
      } else if (isBuble) {
        jsLoaderName = 'buble-loader'
        jsLoaderPath = 'buble-loader'
      }

      if (jsLoaderName) {
        config.module
          .rule('svelte')
          .test(/\.(html|svelte)$/)
          .use(jsLoaderName)
            .loader(jsLoaderPath)
            .options(jsLoaderOptions)
            .end()
          .use('svelte-loader')
            .loader('svelte-loader')
            .options(loaderOptions)
      }
    })
  }
}
