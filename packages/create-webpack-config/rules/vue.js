const merge = require('lodash.merge')
const cssLoaders = require('./css')

module.exports = (config, { babel, cssOptions, vueOptions }) => {
  const defaultVueOptions = {
    postcss: cssOptions.postcss,
    cssModules: {
      localIdentName: '[name]__[local]___[hash:base64:5]',
      camelCase: true
    },
    loaders: Object.assign(cssLoaders.vue(cssOptions), {
      js: {
        loader: require.resolve('babel-loader'),
        options: babel
      }
    })
  }

  const vueRule = config.rules.add('vue', {
    test: /\.vue$/
  })

  vueRule.loaders.add('vue-loader', {
    loader: 'vue-loader',
    options:
      typeof vueOptions === 'function'
        ? vueOptions(defaultVueOptions)
        : merge(defaultVueOptions, vueOptions)
  })
}
