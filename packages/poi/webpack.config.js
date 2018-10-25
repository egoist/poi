const api = require('.')({
  command: 'lint',
  cliArgs: []
})

api.prepare()

module.exports = api.resolveWebpackConfig()
