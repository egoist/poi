const fs = require('fs')
const tildify = require('tildify')
const chalk = require('chalk')
const merge = require('lodash.merge')
const cosmiconfig = require('cosmiconfig')
const AppError = require('./app-error')
const { getConfigFile } = require('./utils')

module.exports = function (options) {
  if (options.config === false) {
    return Promise.resolve()
  }

  const configFile = getConfigFile(options.config)
  const useConfig = fs.existsSync(configFile) ? configFile : null
  return cosmiconfig('vbuild', { cache: false, argv: false })
  .load(process.cwd(), useConfig) // directly use configFile when it exists
  .then(result => {
    if (result && result.filepath) {
      console.log(chalk.bold(`> Using external vbuild config file`))
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

  const devConfig = config.development
  const prodConfig = config.production
  delete config.development
  delete config.production

  return merge(config, options.dev ? devConfig : prodConfig)
}
