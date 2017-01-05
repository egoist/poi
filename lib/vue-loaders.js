const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = function (options) {
  function generateLoader(langs) {
    langs.unshift('css-loader?sourceMap&-autoprefixer')
    if (options.dev || (options.extratct === false)) {
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
    scss: generateLoader(['sass-loader?sourceMap']),
    less: generateLoader(['less-loader?sourceMap']),
    stylus: generateLoader(['stylus-loader?sourceMap']),
    js: 'babel-loader'
  }
}

module.exports.cssProcessors = [
  {loader: '', test: /\.css$/},
  {loader: 'sass-loader?sourceMap', test: /\.scss$/},
  {loader: 'less-loader?sourceMap', test: /\.less$/},
  {loader: 'stylus-loader?sourceMap', test: /\.styl$/},
  {loader: 'sass-loader?indentedSyntax&sourceMap', test: /\.sass$/},
]
