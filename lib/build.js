'use strict'
const co = require('co')
const pify = require('pify')
const getStats = require('./webpack/get-stats')

module.exports = co.wrap(function * (webpackConfig) {
  const webpack = require('webpack')

  const stats = yield pify(webpack)(webpackConfig)
  console.log(getStats(stats))
})
