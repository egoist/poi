'use strict'
const _ = require('./utils')

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
      let pathToHotMiddleware

      if (_.isYarn()) {
        pathToHotMiddleware = _.dir('../webpack-hot-middleware/client')
      } else {
        pathToHotMiddleware = _.dir('node_modules/webpack-hot-middleware/client')
      }

      const hmrClient = options.electron ?
        `${pathToHotMiddleware}?path=http://localhost:${options.port}/__webpack_hmr` :
        pathToHotMiddleware

      if (Array.isArray(options.hot)) {
        options.hot.forEach(name => {
          config.entry[name] = addEntry(config.entry[name], hmrClient)
        })
      } else {
        config.entry.client = addEntry(config.entry.client, hmrClient)
      }
    }
    config.output.publicPath = `http://localhost:${options.port}${config.output.publicPath}`
  }
}
