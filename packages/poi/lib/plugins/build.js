const sharedCLIOptions = require('../utils/sharedCLIOptions')

module.exports = poi => {
  const command = poi.cli.handleCommand(
    'build',
    'Build app in production mode',
    () => poi.runCompiler()
  )

  sharedCLIOptions(command)
}
