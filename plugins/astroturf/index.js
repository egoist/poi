exports.name = 'astroturf'

/**
 * The @poi/astroturf plugin options
 * @typedef {Object} AstroturfOptions
 * @property {Object} loaderOptions - The `astroturf/loader` options
 *     See also {@link https://github.com/4Catalyzer/astroturf/tree/1741c3e702049f6e75483cd000b439d42e57ef2d#options}
 */

exports.apply = (api, options = {}) => {
  const loaderOptions = Object.assign(
    {
      extension: '.module.css'
    },
    options.loaderOptions
  )

  const loaderPath = api.localResolve('astroturf/loader')
  if (!loaderPath) {
    throw new api.PoiError(
      `Cannot find module "astroturf/loader" in your project, did you forget to install "astroturf"?`
    )
  }

  api.hook('createWebpackChain', config => {
    const jsRule = config.module.rule('js')

    addAstroturfLoader(jsRule, loaderOptions, loaderPath)
    if (config.module.rules.get('ts')) {
      addAstroturfLoader(config.module.rule('ts'), loaderOptions, loaderPath)
    }
  })
}

/**
 * @private
 * @param {import('webpack-chain').Rule} rule
 * @param {AstroturfOptions.loaderOptions} loaderOptions
 * @param {string} loaderPath
 */
function addAstroturfLoader(rule, loaderOptions, loaderPath) {
  rule
    .use('astroturf-loader')
    .loader(loaderPath)
    .options(loaderOptions)
}
