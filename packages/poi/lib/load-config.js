const fs = require('fs')
const tildify = require('tildify')
const chalk = require('chalk')
const merge = require('lodash.merge')
const cosmiconfig = require('cosmiconfig')
const AppError = require('./app-error')
const { cwd, getConfigFile } = require('./utils')

module.exports = function (options) {
  if (options.config === false) {
    return Promise.resolve()
  }

  const configFile = getConfigFile(options.config)
  const useConfig = fs.existsSync(configFile) ? configFile : null
  return cosmiconfig('poi', { cache: false, argv: false })
  .load(cwd(options.cwd), useConfig) // directly use configFile when it exists
  .then(result => {
    if (result && result.filepath) {
      console.log(`> Using external Poi config file`)
      console.log(chalk.dim(`> location: "${tildify(result.filepath)}"`))
      return handleConfig(result.config, options)
    }
  })
  .catch(err => {
    if (err.code === 'ENOENT') {
      // only throw when user explictly sets config file
      if (options.config) {
        throw new AppError(`Config file was not found!\n\n${err.message}`)
      }
    } else {
      throw new AppError(err.message)
    }
  })
}

function handleConfig(config, options) {
  if (typeof config === 'function') {
    config = config(options, require)
  }

  config = merge(config, config[options.mode])

  delete config.development
  delete config.production
  delete config.watch
  delete config.test

  return config
}
