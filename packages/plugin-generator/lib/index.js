/**
  This plugin should be added before 3rd-party plugins
 */
const chalk = require('chalk')
const GeneratorManager = require('./GeneratorManager')

exports.extend = api => {
  // eslint-disable-next-line no-multi-assign
  const generatorManager = (api.root.generatorManager = new GeneratorManager(
    api
  ))

  api
    .registerCommand('invoke', 'Invoke a generator', (input, flags) => {
      const name = input[0]
      if (!name) return api.root.cli.showHelp()
      return generatorManager.invokeFromPlugins(name, flags).catch(err => {
        console.log(chalk.red(err.stack))
      })
    })
    .option('overwrite', {
      desc: 'Overwrite existing files',
      type: 'boolean'
    })

  api.registerCommand('add', 'Add a plugin', (input, flags) => {
    const name = input[0]
    if (!name) return api.root.cli.showHelp()
    return generatorManager.add(name, flags).catch(err => {
      console.log(chalk.red(err.stack))
    })
  })

  api.registerCommand(
    'ls-generators',
    'List all available generators in a project',
    () => {
      return generatorManager.listGeneratorsFromPlugins()
    }
  )
}

exports.name = 'generator'
