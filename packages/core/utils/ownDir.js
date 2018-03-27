const path = require('path')

module.exports = (...args) => path.join(__dirname, '..', ...args)
