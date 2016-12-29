'use strict'
const chalk = require('chalk')
const main = require('../lib')

module.exports = (input, flags) => {
  const options = Object.assign({
    entry: input[0]
  }, flags)
  return main(options).catch(err => {
    if (err.name === 'WebpackOptionsValidationError') {
      console.log(err.message)
    } else {
      console.log(chalk.red(err.stack))
    }
    if (!flags.dev) {
      process.exit(1)
    }
  })
}
