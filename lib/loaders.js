// https://github.com/vuejs-templates/webpack/blob/master/template/build/utils.js
const ExtractTextPlugin = require('extract-text-webpack-plugin')

exports.cssLoaders = function (options = {}) {
  // generate loader string to be used with extract text plugin
  function generateLoaders (loaders) {
    const sourceLoader = loaders.map(function (loader) {
      let extraParamChar
      if (/\?/.test(loader)) {
        loader = loader.replace(/\?/, '-loader?')
        extraParamChar = '&'
      } else {
        loader = loader + '-loader'
        extraParamChar = '?'
      }
      return loader + (options.sourceMap ? extraParamChar + 'sourceMap' : '')
    }).join('!')

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: sourceLoader,
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader', sourceLoader].join('!')
    }
  }

  // http://vuejs.github.io/vue-loader/en/configurations/extract-css.html
  return {
    css: generateLoaders(['css?-autoprefixer', 'postcss']),
    less: generateLoaders(['css?-autoprefixer', 'postcss', 'less']),
    sass: generateLoaders(['css?-autoprefixer', 'postcss', 'sass?indentedSyntax']),
    scss: generateLoaders(['css?-autoprefixer', 'postcss', 'sass']),
    stylus: generateLoaders(['css?-autoprefixer', 'postcss', 'stylus']),
    styl: generateLoaders(['css?-autoprefixer', 'postcss', 'stylus'])
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)
  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      loader: loader
    })
  }
  return output
}
