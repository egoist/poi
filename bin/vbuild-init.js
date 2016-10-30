'use strict'
const chalk = require('chalk')
const init = require('../lib/init')

module.exports = (input, flags) => {
  const options = Object.assign({
    projectName: input[0]
  }, flags)
  return init(options).catch(err => {
    console.error(chalk.red(err.stack))
    process.exit(1)
  })
}
