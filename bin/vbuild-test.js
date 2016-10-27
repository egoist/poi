'use strict'
const chalk = require('chalk')
const main = require('../lib')

module.exports = (input, flags) => {
  const options = Object.assign({
    inputFiles: input,
    dev: true,
    test: true
  }, flags)
  return main(options).catch(err => {
    console.error(chalk.red(err.stack))
    process.exit(1)
  })
}
