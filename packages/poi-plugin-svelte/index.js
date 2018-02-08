/**
 * Add Svelte support
 * @name pluginSvelte
 * @param {Object} options
 * @param {any} [options.loaderOptions=undefined] - Options for svelte-loader.
 */
module.exports = function({ loaderOptions } = {}) {
  return poi => {
    poi.extendWebpack(config => {
      config.append('resolve.extensions', '.html')

      const jsRule = config.rules.get('js')
      const isBabel = jsRule.loaders.has('babel-loader')
      const isBuble = jsRule.loaders.has('buble-loader')

      let jsLoaderOptions
      if (isBabel || isBuble) {
        jsLoaderOptions = jsRule.loaders.get(
          isBabel ? 'babel-loader' : 'buble-loader'
        ).options.options
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
        const svelteRule = config.rules.add('svelte', {
          test: /\.(html|svelte)$/
        })
        svelteRule.loaders.add(jsLoaderName, {
          loader: jsLoaderPath,
          options: jsLoaderOptions
        })
        svelteRule.loaders.add('svelte-loader', {
          loader: 'svelte-loader',
          options: Object.assign(
            {
              // Extract CSS in production mode
              emitCss:
                poi.cli.isCurrentCommand('build') &&
                poi.options.extractCSS !== false
            },
            loaderOptions
          )
        })
      }
    })
  }
}
