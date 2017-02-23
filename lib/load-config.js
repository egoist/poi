const tildify = require('tildify')
const chalk = require('chalk')
const merge = require('lodash.merge')
const cosmiconfig = require('cosmiconfig')
const AppError = require('./app-error')
const {getConfigFile} = require('./utils')

module.exports = function (options) {
  const configFile = getConfigFile(options.config)
  return cosmiconfig('vbuild', {cache: false, argv: false})
  .load(null, configFile)
  .then(result => {
    if (result && result.filepath) {
      console.log(chalk.bold(`> Using config from ${tildify(result.filepath)}`))
      return handleConfig(result.config, options)
    }
  })
  .catch(err => {
    if (err.code === 'ENOENT') {
      throw new AppError(`Config file was not found!\n\n${err.message}`)
    } else {
      throw new AppError(err.message)
    }
  })
}

function handleConfig(config, options) {
  if (typeof config === 'function') {
    config = config(options, require)
  }

  const devConfig = config.development
  const prodConfig = config.production
  delete config.development
  delete config.production

  return merge(config, options.dev ? devConfig : prodConfig)
}
