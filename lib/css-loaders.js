'use strict'
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const getVueLoaders = require('./vue-loaders')

module.exports = function (webpackConfig, options) {
  const cssLoader = options.cssModules ?
    'css-loader?-autoprefixer&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]' :
    'css-loader?-autoprefixer'

  if (options.dev || (options.extract === false)) {
    // add preprocessors support for standalone css files
    getVueLoaders.cssProcessors.forEach(processor => {
      let loaders
      if (processor.loader === '') {
        loaders = ['postcss-loader']
      } else {
        loaders = ['postcss-loader', processor.loader]
      }
      webpackConfig.module.rules.push(
        {
          test: processor.test,
          loaders: ['style-loader', cssLoader].concat(loaders)
        }
      )
    })
  } else {
    // add preprocessors support for standalone css files
    // with extracting css
    getVueLoaders.cssProcessors.forEach(processor => {
      let loaders
      if (processor.loader === '') {
        loaders = ['postcss-loader']
      } else {
        loaders = ['postcss-loader', processor.loader]
      }
      webpackConfig.module.rules.push({
        test: processor.test,
        loader: ExtractTextPlugin.extract({
          loader: [cssLoader].concat(loaders),
          fallbackLoader: 'style-loader'
        })
      })
    })
  }
}
