'use strict'
const HtmlWebpackPlugin = require('html-webpack-plugin')
const _ = require('./utils')

module.exports = function (options) {
  if (Array.isArray(options.templates)) {
    return options.template.map(template => {
      return new HtmlWebpackPlugin(template)
    })
  }
  return new HtmlWebpackPlugin({
    filename: _.cwd(`${options.dist}/index.html`),
    title: options.title || 'vbuild app',
    template: options.template ? _.cwd(options.template) : _.dir('lib/template.html'),
    inject: false,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true
    }
  })
}
