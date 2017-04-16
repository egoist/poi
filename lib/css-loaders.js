// https://github.com/vuejs-templates/webpack/blob/master/template/build/utils.js
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const LOADERS = {
  css: ['css-loader', 'postcss-loader'],
  less: ['css-loader', 'postcss-loader'],
  sass: ['css-loader', 'postcss-loader', 'sass-loader'],
  scss: ['css-loader', 'postcss-loader', 'sass-loader?indentedSyntax'],
  stylus: ['css-loader', 'postcss-loader', 'stylus-loader'],
  styl: ['css-loader', 'postcss-loader', 'stylus-loader']
}

exports.vue = function (options) {
  const result = {}
  for (const extension in LOADERS) {
    const loaders = LOADERS[extension]
    const rules = loaders.map(loader => getRule(loader, options))
    if (options.extractCSS) {
      result[extension] = ExtractTextPlugin.extract({
        use: rules,
        fallback: 'vue-style-loader'
      })
    } else {
      result[extension] = ['vue-style-loader'].concat(rules)
    }
  }
  return result
}

// Generate loaders for standalone style files (outside of .vue)
exports.standalone = function (config, options) {
  for (const extension in LOADERS) {
    const loaders = LOADERS[extension]
    const thisRule = config.module
      .rule(extension)
      .test(new RegExp(`\\.${extension}$`))
    let rules = loaders.map(loader => getRule(loader, options))
    if (options.extractCSS) {
      rules = ExtractTextPlugin.extract({
        use: rules,
        fallback: 'vue-style-loader'
      })
    } else {
      thisRule.use('style').loader('vue-style-loader')
    }
    rules.forEach(rule => {
      thisRule.use(rule.loader)
        .loader(rule.loader)
        .options(rule.options)
    })
  }
}

function getRule(loader, {
  minimize,
  sourceMap,
  cssModules,
  postcss
} = {}) {
  const options = {
    sourceMap
  }

  if (loader === 'css-loader') {
    options.minimize = minimize
    if (cssModules) {
      options.modules = true
      options.importLoaders = 1
      options.localIdentName = '[name]_[local]__[hash:base64:5]'
    }
  }

  if (loader === 'postcss-loader') {
    if (Array.isArray(postcss)) {
      options.plugins = postcss
    } else if (typeof postcss === 'object') {
      Object.assign(options, postcss)
    }
    // Never let postcss-loader load config file
    options.plugins = options.plugins || []
  }

  return {
    loader,
    options
  }
}
