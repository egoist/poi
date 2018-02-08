const path = require('path')

function localRequire(m) {
  return /^[./]|(^[a-zA-Z]:)/.test(m)
    ? require(path.resolve(m))
    : require(path.resolve('node_modules', m))
}

module.exports = localRequire
