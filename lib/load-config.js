const fs = require('fs')
const tildify = require('tildify')
const chalk = require('chalk')
const requireUncached = require('require-uncached')
const _ = require('./utils')
const AppError = require('./app-error')

module.exports = function (options) {
  const configPath = _.getConfigFile(options.config)

  if (configPath && fs.existsSync(configPath)) {
    console.log(`> Using config file at ${chalk.yellow(tildify(configPath))}`)
    let userConfig = requireUncached(configPath)
    if (typeof userConfig === 'function') {
      userConfig = userConfig(options, require)
    }
    const devConfig = userConfig.development
    const prodConfig = userConfig.production
    delete userConfig.development
    delete userConfig.production
    return Object.assign({}, userConfig, options.dev ? devConfig : prodConfig)
  }

  if (configPath && options.config) {
    throw new AppError(chalk.red(`> Config file does not exist at ${tildify(configPath)}`))
  }

  return {}
}
