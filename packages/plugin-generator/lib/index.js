/**
  This plugin should be added before 3rd-party plugins
 */
const chalk = require('chalk')
const Generator = require('./generator')

exports.extend = api => {
  api.cli
    .command('invoke', 'Invoke a generator', (input, flags) => {
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

  api.cli.command('add', 'Add a plugin', (input, flags) => {
    return new Generator(api).add(input[0], flags).catch(err => {
      console.log(chalk.red(err.stack))
    })
  })

  api.cli.command(
    'ls-generators',
    'List all available generators in a project',
    () => {
      return new Generator(api).listGeneratorsFromPlugins()
    }
  )
}

exports.name = 'generator'
