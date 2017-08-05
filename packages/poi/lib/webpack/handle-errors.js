const chalk = require('chalk')
const highlight = require('highlight-es')
const logger = require('../logger')

const cannotUglifyES6 = message => {
  return /from UglifyJs/.test(message) &&
  /Unexpected token:/.test(message)
}

const getModuleNameFromPath = str => {
  const [, name] = /[/\\]node_modules[/\\]([^/\\]+)/.exec(str)
  return name
}

module.exports = errors => {
  for (const error of errors) {
    if (/Cannot find module 'webpack'/.test(error.message)) {
      console.error(chalk.red(`Cannot find "webpack" in project directory.`))
      console.error(chalk.red(`It's recommended to install "poi" as a devDependency.`))
    } else if (/Vue packages version mismatch/.test(error.message)) {
      let message = error.message.replace(/This may cause things to work incorrectly[\s\S]+/, '')
      message += 'Make sure to install both packages with the same version in your project.\nOtherwise webpack will use transitive dependencies from Poi.'
      console.error(chalk.red(message))
    } else if (cannotUglifyES6(error.message)) {
      const name = getModuleNameFromPath(error.message)
      console.error(`${chalk.red('UglifyJS error')}: unexpected ES6+ code in module "${name}", full error message:\n`)
      console.error(chalk.dim(error.message))
      console.log()
      logger.tip(chalk.bold(`To fix this, try adding "${name}" to "transformModules" option, eg:`))
      console.log()
      console.log(highlight(`// poi.config.js
module.exports = {
  transformModules: ['${name}'],
  // ...other config
}`))
    } else {
      console.error(error.message)
    }
  }
  process.exitCode = 1
}
