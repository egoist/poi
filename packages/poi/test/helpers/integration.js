const path = require('path')

module.exports = function integration(...args) {
  return path.join(__dirname, '../integration', ...args)
}
