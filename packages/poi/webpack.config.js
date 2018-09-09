const api = require('.')({
  command: 'build',
  cliOptions: {
    args: ['build']
  }
})

api.applyPlugins()

module.exports = api.createWepackConfig()
