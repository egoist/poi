const fs = require('fs')
const tildify = require('tildify')
const chalk = require('chalk')
const requireUncached = require('require-uncached')
const _ = require('./utils')

module.exports = function (options) {
  if (options.config) {
    const configPath = _.getConfigFile(options.config)
    if (fs.existsSync(configPath)) {
      const userConfig = requireUncached(configPath)
      if (typeof userConfig === 'function') {
        return userConfig(options, require)
      }
      return userConfig
    }
    console.error(chalk.red(`> Config file does not exist at ${tildify(configPath)}`))
    process.exit(1)
  }
  return {}
}
