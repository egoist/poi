const resolveFrom = require('resolve-from')

module.exports = (plugins, cwd) => {
  return plugins.map(plugin => {
    if (typeof plugin === 'string') {
      plugin = {
        resolve: plugin
      }
    }
    if (plugin && plugin.resolve) {
      return Object.assign({}, plugin, {
        resolve:
          typeof plugin.resolve === 'string'
            ? require(resolveFrom(cwd, plugin.resolve))
            : plugin.resolve
      })
    }
    throw new TypeError(`Invalid plugin: ${plugin}`)
  })
}
