'use strict'
const chalk = require('chalk')
const main = require('../lib')

module.exports = (input, flags) => {
  const options = Object.assign({
    entry: input[0]
  }, flags)
  return main(options).catch(e => {
    if (e.name === 'WebpackOptionsValidationError') {
      console.log(e.message)
    } else {
      console.log(chalk.red(e.stack))
    }
    if (!flags.dev && !flags.watch) {
      process.exit(1)
    }
  })
}
