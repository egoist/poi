/**
  This plugin should be added before 3rd-party plugins
 */
const chalk = require('chalk')
const Generator = require('./generator')

exports.extend = api => {
  api
    .registerCommand('invoke', 'Invoke a generator', (input, flags) => {
      return new Generator(api)
        .invokeFromPlugins(input[0], flags)
        .catch(err => {
          console.log(chalk.red(err.stack))
        })
    })
    .option('overwrite', {
      desc: 'Overwrite existing files',
      type: 'boolean'
    })

  api.registerCommand('add', 'Add a plugin', (input, flags) => {
    return new Generator(api).add(input[0], flags).catch(err => {
      console.log(chalk.red(err.stack))
    })
  })

  api.registerCommand(
    'ls-generators',
    'List all available generators in a project',
    () => {
      return new Generator(api).listGeneratorsFromPlugins()
    }
  )
}

exports.name = 'generator'
