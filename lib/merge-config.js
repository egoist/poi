'use strict'
const webpackMerge = require('webpack-merge')
const _ = require('./utils')

module.exports = function (webpackConfig, options) {
  // read user config
  if (typeof options.mergeConfig === 'string') {
    return webpackMerge.smart({}, webpackConfig, require(_.cwd(options.mergeConfig)))
  } else if (Array.isArray(options.mergeConfig)) {
    return options.mergeConfig.reduce((current, next) => {
      return webpackMerge.smart(current, next)
    }, webpackConfig)
  } else if (typeof options.mergeConfig === 'object') {
    return webpackMerge.smart({}, webpackConfig, options.mergeConfig)
  }
  return webpackConfig
}
