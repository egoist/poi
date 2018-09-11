const setSharedCLIOptions = require('./utils/shared-cli-options')

exports.extend = api => {
  const command = api.registerCommand('build', 'Build your app', async () => {
    await api.bundle()
  })

  setSharedCLIOptions(command)
  command.option(
    'clean-out-dir',
    'Clean output directory before bundling (default: true)'
  )
}

exports.name = 'builtin:build'
