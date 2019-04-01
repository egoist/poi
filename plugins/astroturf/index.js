exports.name = 'astroturf'

/**
 * The @poi/astroturf plugin options
 * @typedef {Object} AstroturfOptions
 * @property {Object} loaderOptions - The `astroturf/loader` options
 *     See also {@link https://github.com/4Catalyzer/astroturf/tree/1741c3e702049f6e75483cd000b439d42e57ef2d#options}
 */

exports.apply = (api, options = {}) => {
  options = {
    ...options,
    loaderOptions: {
      extension: '.module.css',
      ...options.loaderOptions
    }
  }

  api.hook('createWebpackChain', config => {
    const jsRule = config.module.rule('js')

    addAstroturfLoader(jsRule, options.loaderOptions)
    if (config.module.rules.get('ts')) {
      addAstroturfLoader(config.module.rule('ts'), options.loaderOptions)
    }
  })
}

/**
 * @private
 * @param {WebpackChain~Rule} rule -
 * @param {AstroturfOptions.loaderOptions} loaderOptions -
 */
function addAstroturfLoader(rule, loaderOptions) {
  rule
    .use('astroturf-loader')
    .loader(require.resolve('astroturf/loader'))
    .options(loaderOptions)
}
