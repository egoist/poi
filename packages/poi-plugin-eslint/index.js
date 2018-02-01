/**
 * Add ESLint to build pipeline
 * @name pluginESLint
 * @param {Object} options
 * @param {any} [options.loaderOptions=undefined] - Options for eslint-loader.
 * @param {string|Array<string>} [options.command='build'] - In which command to run ESLint.
 * It could be a wildcard symbol `*` which means all commands, or an array of command like `['build', 'test']`
 * @example
 * require('poi-plugin-eslint')({
 *   loaderOptions: {
 *     configFile: '/path/to/.eslintrc',
 *     // Enforce our own ESLint config file
 *     useEslintrc: false
 *   }
 * })
 */
module.exports = function({ loaderOptions, command = 'build' } = {}) {
  return poi => {
    if (!poi.cli.isCurrentCommand(command)) return

    poi.extendWebpack(config => {
      const eslintRule = config.rules.add('eslint', {
        test: /\.(js|jsx|vue)$/,
        exclude: [/node_modules/],
        enforce: 'pre'
      })
      eslintRule.loaders.add('eslint-loader', {
        loader: 'eslint-loader',
        options: loaderOptions
      })
    })
  }
}
