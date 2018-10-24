const resolveFrom = require('resolve-from')

module.exports = (plugins, cwd) => {
  return plugins.map(plugin => {
    if (typeof plugin === 'string') {
      plugin = {
        resolve: plugin
      }
    }
    if (plugin && typeof plugin === 'object') {
      return Object.assign({}, plugin, {
        resolve: require(resolveFrom(cwd, plugin.resolve))
      })
    }
    throw new TypeError(`Invalid plugin: ${plugin}`)
  })
}
