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
    const config = poi.webpackConfig

    config.resolve
      .extensions
      .add('.html')

    const jsRule = config.module.rule('js')
    const isBabel = jsRule.uses.has('babel')
    const isBuble = jsRule.uses.has('buble')

    let jsLoaderOptions
    if (isBabel || isBuble) {
      jsLoaderOptions = config.module
        .rule('js')
          .use(isBabel ? 'babel' : 'buble')
            .store.get('options')
    }

    let jsLoaderPath
    let jsLoaderName
    if (isBabel) {
      jsLoaderName = 'babel'
      jsLoaderPath = 'babel-loader'
    } else if (isBuble) {
      jsLoaderName = 'buble'
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
        .use('svelte')
          .loader(require.resolve('svelte-loader'))
          .options(loaderOptions)
    }
  }
}
