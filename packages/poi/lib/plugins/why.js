exports.name = 'builtin:why'

exports.extend = api => {
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

  api.registerCommand(
    'why-generator',
    'Identifies why a generator exists',
    input => {
      const name = input[0]
      if (!name) {
        return api.root.cli.showHelp()
      }
      const { generator } = api.root
      const generators = generator.setGeneratorsFromPlugins()
      if (!generators.has(name)) {
        return api.logger.error(`Generator '${name}' does not exist!`)
      }
      console.log(
        `Generator '${name}' is added by plugin '${
          generators.get(name).__plugin
        }'`
      )
    }
  )
}
