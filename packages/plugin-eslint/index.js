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
