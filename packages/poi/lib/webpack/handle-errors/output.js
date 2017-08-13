const chalk = require('chalk')
const highlight = require('highlight-es')
const _ = require('lodash')
const tildify = require('tildify')
const logger = require('../../logger')

function groupErrorsByType(errors) {
  return errors.reduce((res, error) => {
    res[error.type] = res[error.type] || []
    res[error.type].push(error)
    return res
  }, {})
}

function moduleNotFound(errors) {
  if (!errors) return

  errors = _.uniqBy(errors, 'payload')

  console.log(`Following modules are not found in current project, did you forget to install?\n`)
  console.log(errors.map(error => {
    const requestedBy = (error.error.origin && error.error.origin.resource) ? chalk.dim(`: requested by ${chalk.italic(tildify(error.error.origin.resource))}`) : ''
    return `- ${chalk.yellow(error.payload)}${requestedBy}`
  }).join('\n'))
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

function unknownError(errors) {
  if (!errors) return

  errors.forEach(error => {
    if (error.error.origin && error.error.origin.resource) {
      console.error(chalk.red(`${error.error.name} issued by ${chalk.italic(tildify(error.error.origin.resource))}`))
    }
    console.error(error.error.message)
  })
}

function babelPluginNotFound(errors) {
  if (!errors) return

  const error = errors[0]
  console.log(`Following babel plugin is referenced in ${chalk.italic(tildify(error.payload.location))}\nbut not installed in current project:\n`)
  console.log(`- ${error.payload.name.replace(/^(babel-plugin-)?/, 'babel-plugin-')}`)
}

function babelPresetNotFound(errors) {
  if (!errors) return

  const error = errors[0]
  console.log(`Following babel preset is not found in ${chalk.italic(tildify(error.payload.location))}:\n`)
  console.log(`- ${error.payload.name.replace(/^(babel-preset-)?/, 'babel-preset-')}`)
}

function eslintError(errors) {
  if (!errors) return

  console.error(`${chalk.red('code quality problems:')}`)
  const error = errors[0]
  console.error(error.error.message)
  logger.tip('You may use special comments to disable some warnings.')
  console.log(chalk.dim(`
- Use ${chalk.yellow('// eslint-disable-next-line')} to ignore the next line.
- Use ${chalk.yellow('/* eslint-disable */')} to ignore all warnings in a file.`))
}

module.exports = errors => {
  errors = groupErrorsByType(errors)
  moduleNotFound(errors['module-not-found'])
  uglifyError(errors['uglify-error'])
  vueVersionMismatch(errors['vue-version-mismatch'])
  babelPluginNotFound(errors['babel-plugin-not-found'])
  babelPresetNotFound(errors['babel-preset-not-found'])
  eslintError(errors['eslint-error'])
  unknownError(errors.unknown)
}
