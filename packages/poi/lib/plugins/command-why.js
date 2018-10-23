exports.name = 'builtin:command-why'

exports.apply = api => {
  api.registerCommand(
    'why-command',
    'Identifies why a command exists',
    input => {
      const name = input[0]
      if (!name) {
        return api.root.cli.showHelp()
      }
      if (!api.commands.get(name)) {
        return api.logger.error(`Command '${name}' does not exist!`)
      }
      console.log(
        `Command '${name}' is registered by plugin '${api.commands.get(name)}'`
      )
    }
  )
}
