'use strict'

const addEntry = (entry, newEntry) => {
  if (typeof entry === 'string') {
    return [entry, newEntry]
  } else if (Array.isArray(entry)) {
    return entry.concat(newEntry)
  }
  return entry
}

module.exports = function (config, options) {
  if (options.electron) {
    config.target = 'electron-renderer'
  }
  if (options.dev) {
    if (!options.live) {
      const pathToHotMiddleware = require.resolve('webpack-hot-middleware/client') + '?reload=true'

      const hmrClient = options.electron ?
        `${pathToHotMiddleware}&path=http://localhost:${options.port}/__webpack_hmr` :
        pathToHotMiddleware

      if (Array.isArray(options.hot)) {
        options.hot.forEach(name => {
          config.entry[name] = addEntry(config.entry[name], hmrClient)
        })
      } else {
        const client = typeof options.hot === 'string' ? options.hot : 'client'
        config.entry[client] = addEntry(config.entry[client], hmrClient)
      }
    }
    config.output.publicPath = `http://localhost:${options.port}${config.output.publicPath}`
  }
}
