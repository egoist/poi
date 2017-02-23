const path = require('path')

exports.cwd = function (...args) {
  return path.resolve(...args)
}

exports.ownDir = function (...args) {
  return path.join(__dirname, '../', ...args)
}

exports.getConfigFile = function (config) {
  if (config === false) {
    return
  }

  let configFile

  if (typeof config === 'string') {
    configFile = config
  } else {
    configFile = 'vbuild.config.js'
  }

  return exports.cwd(configFile)
}

exports.getPublicPath = function (homepage) {
  if (homepage) {
    return /\/$/.test(homepage) ? homepage : (homepage + '/')
  }
  return '/'
}

exports.ensureEntry = function (obj) {
  for (const key in obj) {
    if (!Array.isArray(obj[key])) {
      obj[key] = [obj[key]]
    }
  }
  return obj
}
