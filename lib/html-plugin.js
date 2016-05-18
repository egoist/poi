'use strict'
const HtmlWebpackPlugin = require('html-webpack-plugin')
const _ = require('./utils')

module.exports = function (options) {
  return new HtmlWebpackPlugin({
    filename: _.cwd(`${options.dist}/index.html`),
    title: options.title || 'vbuild app',
    template: options.template ? _.cwd(options.template) : _.dir('lib/index.hbs'),
    inject: false,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true
    }
  })
}
