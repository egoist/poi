const resolveFrom = require('resolve-from')

function isLocalPath(input) {
  return /^[./]|(^[a-zA-Z]:)/.test(input)
}

function getModuleName(name) {
  return name.replace(/^(poi-plugin-)?/, 'poi-plugin-')
}

module.exports = (plugins, cwd) => {
  return plugins.map(plugin => {
    if (plugin && typeof plugin === 'object') {
      return plugin
    }
    if (typeof plugin === 'string') {
      return isLocalPath(plugin)
        ? require(plugin)
        : require(resolveFrom(cwd, getModuleName(plugin)))
    }
    throw new TypeError(`Invalid plugin: ${plugin}`)
  })
}
