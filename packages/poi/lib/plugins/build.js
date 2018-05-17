const sharedCLIOptions = require('../utils/sharedCLIOptions')

module.exports = {
  name: 'builtin:build',
  apply(poi) {
    const command = poi.cli.handleCommand(
      'build',
      'Build app in production mode',
      () => poi.runCompiler()
    )

    sharedCLIOptions(command)
  }
}
