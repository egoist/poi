/**
  This plugin should be added before 3rd-party plugins
 */
const chalk = require('chalk')
const Generator = require('./generator')

exports.extend = api => {
  // eslint-disable-next-line no-multi-assign
  const generator = (api.root.generator = new Generator(api))

  api
    .registerCommand('invoke', 'Invoke a generator', (input, flags) => {
      const name = input[0]
      if (!name) return api.root.cli.showHelp()
      return generator.invokeFromPlugins(name, flags).catch(err => {
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
    return generator.add(name, flags).catch(err => {
      console.log(chalk.red(err.stack))
    })
  })

  api.registerCommand(
    'ls-generators',
    'List all available generators in a project',
    () => {
      return generator.listGeneratorsFromPlugins()
    }
  )
}

exports.name = 'generator'
