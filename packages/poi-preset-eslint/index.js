/**
 * Add ESLint to build pipeline
 * @name presetESLint
 * @param {Object} options
 * @param {any} [options.loaderOptions=undefined] - Options for eslint-loader.
 * @param {string|Array<string>} [options.mode='production'] - In which mode to run ESLint.
 * It could be a wildcard symbol `*` which means all modes, or an array of modes like `['production', 'test']`
 * @example
 * require('poi-preset-eslint')({
 *   loaderOptions: {
 *     configFile: '/path/to/.eslintrc',
 *     // Enforce our own ESLint config file
 *     useEslintrc: false
 *   }
 * })
 */
module.exports = function ({
  loaderOptions,
  mode = 'production'
} = {}) {
  return poi => {
    poi.mode(mode, () => {
      poi.webpackConfig.module.rule('eslint')
        .test(/\.(js|jsx|vue)$/)
        .exclude
          .add(/node_modules/)
          .end()
        .pre()
        .use('eslint-loader')
          .loader('eslint-loader')
          .options(loaderOptions)
    })
  }
}
