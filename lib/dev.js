'use strict'

module.exports = function (webpackConfig, options) {
  const server = require('./server')

  server(webpackConfig, options)
}
