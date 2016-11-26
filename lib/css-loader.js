const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = function (dev) {
  function generateLoader(langs) {
    langs.unshift('css-loader?sourceMap&-autoprefixer')
    if (dev) {
      return ['vue-style-loader'].concat(langs).join('!')
    }
    return ExtractTextPlugin.extract({
      fallbackLoader: 'vue-style-loader',
      loader: langs.join('!')
    })
  }

  return {
    css: generateLoader([]),
    sass: generateLoader(['sass-loader?indentedSyntax']),
    scss: generateLoader(['sass-loader']),
    less: generateLoader(['less-loader']),
    stylus: generateLoader(['stylus-loader'])
  }
}
