const fs = require('fs')
const tildify = require('tildify')
const chalk = require('chalk')
const _ = require('./utils')

module.exports = function (options) {
  let config = options.config
  if (config) {
    if (config === true) {
      config = 'vbuild.config.js'
    }
    const configPath = _.cwd(config)
    if (fs.existsSync(configPath)) {
      const userConfig = require(configPath)
      if (typeof userConfig === 'function') {
        return userConfig(options, require)
      }
      return userConfig
    } else {
      console.error(chalk.red(`> Config file does not exist at ${tildify(configPath)}`))
      process.exit(1)
    }
  }
  return {}
}
