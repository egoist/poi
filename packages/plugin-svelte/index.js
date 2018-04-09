/**
 * Add Svelte support
 * @name pluginSvelte
 * @param {Object} options
 * @param {any} [options.loaderOptions=undefined] - Options for svelte-loader.
 */
module.exports = function({ loaderOptions } = {}) {
  return poi => {
    poi.extendWebpack(config => {
      config.resolve.extensions.add('.html')

      const jsRule = config.module.rule('js')
      const isBabel = jsRule.uses.has('babel-loader')
      const isBuble = jsRule.uses.has('buble-loader')

      let jsLoaderOptions
      if (isBabel || isBuble) {
        jsLoaderOptions = jsRule.module
          .rule(isBabel ? 'babel-loader' : 'buble-loader')
          .get('options')
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
        const svelteRule = config.module.rule('svelte').test(/\.(html|svelte)$/)
        svelteRule
          .use(jsLoaderName)
          .loader(jsLoaderPath)
          .options(jsLoaderOptions)
        svelteRule
          .use('svelte-loader')
          .loader('svelte-loader')
          .options(
            Object.assign(
              {
                // Extract CSS in production mode
                emitCss:
                  poi.cli.isCurrentCommand('build') &&
                  poi.options.css.extract !== false
              },
              loaderOptions
            )
          )
      }
    })
  }
}
