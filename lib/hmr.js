'use strict'
const webpack = require('webpack')

const addEntry = (entry, newEntry) => {
  if (typeof entry === 'string') {
    return [entry, newEntry]
  } else if (Array.isArray(entry)) {
    return entry.concat(newEntry)
  }
  return entry
}

module.exports = function (config, options) {
  if (options.dev) {
    const publicPath = `http://${options.host}:${options.port}/`
    // with electron and dev mode
    if (options.electron) {
      config.output.publicPath = publicPath
    }
    // with dev mode and hot reloading
    if (!options.live) {
      const pathToHotMiddleware = require.resolve('webpack-hot-middleware/client') + '?reload=true'

      const hmrClient = `${pathToHotMiddleware}&path=${publicPath}__webpack_hmr`

      if (Array.isArray(options.hot)) {
        // hot-ish custom entries
        options.hot.forEach(name => {
          config.entry[name] = addEntry(config.entry[name], hmrClient)
        })
      } else {
        // hot-ish client entry
        const client = typeof options.hot === 'string' ? options.hot : 'client'
        config.entry[client] = addEntry(config.entry[client], hmrClient)
      }
      config.plugins.push(new webpack.HotModuleReplacementPlugin())
    }
  }
}
