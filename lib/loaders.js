// https://github.com/vuejs-templates/webpack/blob/master/template/build/utils.js
const ExtractTextPlugin = require('extract-text-webpack-plugin')

exports.cssLoaders = function (options = {}) {
  // generate loader string to be used with extract text plugin
  function generateLoaders(loaders) {
    const sourceLoader = loaders.map(loader => {
      let extraParamChar
      if (/\?/.test(loader)) {
        loader = loader.replace(/\?/, '-loader?')
        extraParamChar = '&'
      } else {
        loader += '-loader'
        extraParamChar = '?'
      }
      return loader + (options.sourceMap ? extraParamChar + 'sourceMap' : '')
    })

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: sourceLoader,
        fallback: 'vue-style-loader'
      })
    }
    return ['vue-style-loader'].concat(sourceLoader)
  }

  // http://vuejs.github.io/vue-loader/en/configurations/extract-css.html
  const append = options.cssModules ?
    '?-autoprefixer&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]' :
    '?-autoprefixer'
  return {
    css: generateLoaders([`css${append}`, 'postcss']),
    less: generateLoaders([`css${append}`, 'postcss', 'less']),
    sass: generateLoaders([`css${append}`, 'postcss', 'sass?indentedSyntax']),
    scss: generateLoaders([`css${append}`, 'postcss', 'sass']),
    stylus: generateLoaders([`css${append}`, 'postcss', 'stylus']),
    styl: generateLoaders([`css${append}`, 'postcss', 'stylus'])
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
      use: loader
    })
  }
  return output
}
