const merge = require('lodash/merge')
const cssLoaders = require('./css-loaders')

module.exports = (config, { babel, cssOptions, vueOptions }) => {
  const defaultVueOptions = {
    postcss: cssOptions.postcss,
    cssModules: {
      localIdentName: '[name]__[local]___[hash:base64:5]',
      camelCase: true
    },
    loaders: Object.assign(cssLoaders.vue(cssOptions), {
      js: {
        loader: 'babel-loader',
        options: babel
      }
    })
  }
  config.module
    .rule('vue')
      .test(/\.vue$/)
      .use('vue-loader')
        .loader('vue-loader')
        .options(typeof vueOptions === 'function' ?
          vueOptions(defaultVueOptions) :
          merge(defaultVueOptions, vueOptions))
}
