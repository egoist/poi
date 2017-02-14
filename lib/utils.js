const path = require('path')

exports.cwd = function (...args) {
  return path.resolve(...args)
}

exports.ownDir = function (...args) {
  return path.join(__dirname, '../', ...args)
}

exports.getConfigFile = function (config) {
  if (!config) {
    return
  }
  if (config === true) {
    return exports.cwd('vbuild.config.js')
  }
  return exports.cwd(config)
}
