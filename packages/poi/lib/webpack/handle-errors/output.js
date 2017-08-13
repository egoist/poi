const chalk = require('chalk')
const highlight = require('highlight-es')
const logger = require('../../logger')

function moduleNotFound(errors) {
  if (!errors) return

    const modules = errors.map(error => `- ${error.payload}`)
  console.log(`Following modules are not found in current project, did you forget to install?\n`)
  console.log(modules.join('\n'))
}

function uglifyError(errors) {
  if (!errors) return
  // There's always only ONE uglify-token-error
  const error = errors[0]

  const { message } = error.error
  console.error(`${chalk.red('UglifyJS error')}: unexpected ES6+ code in module "${error.payload}", full error message:\n`)
  console.error(chalk.dim(message))
  console.log()
  logger.tip(chalk.bold(`To fix this, try adding "${error.payload}" to "transformModules" option, eg:`))
  console.log()
  console.log(highlight(`// poi.config.js
module.exports = {
  transformModules: ['${error.payload}'],
  // ...other config
}`))
}

function vueVersionMismatch(errors) {
  if (!errors) return

  const error = errors[0]
  let message = error.message.replace(/This may cause things to work incorrectly[\s\S]+/, '')
  message += 'Make sure to install both packages with the same version in your project.\nOtherwise webpack will use transitive dependencies from Poi.'
  console.error(chalk.red(message))
}

function groupErrorsByType(errors) {
  return errors.reduce((res, error) => {
    res[error.type] = res[error.type] || []
    res[error.type].push(error)
    return res
  }, {})
}

module.exports = errors => {
  errors = groupErrorsByType(errors)
  moduleNotFound(errors['module-not-found'])
  uglifyError(errors['uglify-error'])
  vueVersionMismatch(errors['vue-version-mismatch'])
}
