const Server = require('webpack-dev-server')

module.exports = (...args) => {
  return new Server(...args)
}
