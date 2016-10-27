'use strict'
const chalk = require('chalk')
const main = require('../lib')

module.exports = (input, flags) => {
  const options = Object.assign({
    entry: input[0],
    input: input,
  }, flags)
  return main(options).catch(e => {
    console.log(chalk.red(e.stack))
    if (!cli.dev && !cli.watch) {
      process.exit(1)
    }
  })
}
