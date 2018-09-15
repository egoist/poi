const api = require('.')({
  command: 'lint',
  cliArgs: []
})

api.applyPlugins()

module.exports = api.createWepackConfig()
