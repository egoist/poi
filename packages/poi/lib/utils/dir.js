const path = require('path')

exports.cwd = function(cwd, ...args) {
  return path.resolve(cwd || process.cwd(), ...args)
}

exports.ownDir = function(...args) {
  return path.join(__dirname, '../../', ...args)
}
