'use strict'
const HtmlWebpackPlugin = require('html-webpack-plugin')
const _ = require('./utils')

module.exports = function (options) {
  const defaultOptions = typeof options.template === 'string' ? {
    title: options.title || 'vbuild app',
    template: options.template ? _.cwd(options.template) : _.dir('lib/template.html'),
    inject: false,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      minifyJS: true,
      minifyCSS: true
    },
    ga: options.ga || options.analytics || options.googleAnalytics
  } : options.template
  if (Array.isArray(options.templates)) {
    return options.templates.map(template => {
      return new HtmlWebpackPlugin(Object.assign(
        {},
        defaultOptions,
        template
      ))
    })
  }
  return new HtmlWebpackPlugin(defaultOptions)
}
