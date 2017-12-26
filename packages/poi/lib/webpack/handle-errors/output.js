const path = require('path')
const chalk = require('chalk')
const highlight = require('highlight-es')
const _ = require('lodash')
const logger = require('../../logger')

function relativePath(p) {
  return chalk.green(path.relative(process.cwd(), p) || './')
}

function groupErrorsByType(errors) {
  return errors.reduce((res, error) => {
    res[error.type] = res[error.type] || []
    res[error.type].push(error)
    return res
  }, {})
}

function moduleNotFound(errors) {
  if (!errors) return false

  let res = []
  errors = _.uniqBy(errors, 'payload')

  res.push(`${chalk.red('module not found:')}\n`)
  res = res.concat(errors.map(error => {
    const requestedBy = (error.error.origin && error.error.origin.resource) ? chalk.dim(`: imported at ${chalk.italic(relativePath(error.error.origin.resource))}`) : ''
    return `- ${chalk.yellow(error.payload)}${requestedBy}`
  }))

  return res.join('\n')
}

function uglifyError(errors) {
  if (!errors) return false
  // There's always only ONE uglify-token-error
  const error = errors[0]

  const res = []
  const { message } = error.error

  if (error.kind === 'module') {
    res.push(`${chalk.red('UglifyJS error')}: unexpected ES6+ code in module "${error.payload}", full error message:\n`)
    res.push(chalk.dim(message))
    res.push('')
    res.push(
      logger.tip(chalk.bold(`To fix this, try adding "${error.payload}" to "transformModules" option, eg:`), false)
    )
    res.push('')
    res.push(highlight(`// poi.config.js
module.exports = {
  transformModules: ['${error.payload}'],
  // ...other config
}`))
  } else if (error.kind === 'file') {
    res.push(`${chalk.red('UglifyJS error')}: unexpected ES6+ code in file "${error.payload}", full error message:\n`)
    res.push(chalk.dim(message))
    res.push('')
    res.push(
      logger.tip(chalk.bold(`To fix this, please configure .babelrc to compile your app code down to ES5 or use poi-preset-babel-minify if you want to preserve ES6+ code in final bundle.`), false)
    )
  }

  return res.join('\n')
}

function vueVersionMismatch(errors) {
  if (!errors) return

  const res = []
  const error = errors[0]
  let message = error.error.message.replace(/This may cause things to work incorrectly[\s\S]+/, '')
  message += 'Make sure to install both packages with the same version in your project.\nOtherwise webpack will use transitive dependencies from Poi.'
  res.push(chalk.red(message))

  return res.join('\n')
}

function unknownError(errors) {
  if (!errors) return false

  const res = errors.map(error => {
    let msg = ''
    if (error.error.module && error.error.module.resource) {
      msg += chalk.red(`Error in ${chalk.italic(relativePath(error.error.module.resource))}`)
      msg += '\n\n'
    }
    if (error.error.message) {
      msg += error.error.message.replace(/Module build failed:\s+/, '').trim()
    } else {
      msg += error.error.trim()
    }
    return msg
  })

  return res.join('\n')
}

function babelPluginNotFound(errors) {
  if (!errors) return false

  const res = []

  const error = errors[0]
  res.push(`${chalk.red('missing babel plugin:')} following babel plugin is referenced in ${chalk.italic(relativePath(error.payload.location))}\nbut not installed in current project:\n`)
  res.push(`- ${error.payload.name.replace(/^(babel-plugin-)?/, 'babel-plugin-')}`)

  return res.join('\n')
}

function babelPresetNotFound(errors) {
  if (!errors) return false

  const res = []
  const error = errors[0]
  res.push(`${chalk.red('missing babel preset:')} following babel preset is not found in ${chalk.italic(relativePath(error.payload.location))}:\n`)
  res.push(`- ${error.payload.name.replace(/^(babel-preset-)?/, 'babel-preset-')}`)

  return res.join('\n')
}

function eslintError(errors) {
  if (!errors) return false

  const res = []
  res.push(`${chalk.red('code quality problems:')}`)
  const error = errors[0]
  res.push(error.error.message)
  res.push(
    logger.tip('You may use special comments to disable some warnings.', false)
  )
  res.push(chalk.dim(`
- Use ${chalk.yellow('// eslint-disable-next-line')} to ignore the next line.
- Use ${chalk.yellow('/* eslint-disable */')} to ignore all warnings in a file.`))

  return res.join('\n')
}

function run(results) {
  console.log(results.filter(result => result).join('\n\n'))
  console.log()
}

module.exports = errors => {
  errors = groupErrorsByType(errors)
  run([
    moduleNotFound(errors['module-not-found']),
    uglifyError(errors['uglify-error']),
    vueVersionMismatch(errors['vue-version-mismatch']),
    babelPluginNotFound(errors['babel-plugin-not-found']),
    babelPresetNotFound(errors['babel-preset-not-found']),
    eslintError(errors['eslint-error']),
    unknownError(errors.unknown)
  ])
}
