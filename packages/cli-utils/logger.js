const chalk = require('chalk')
const icon = require('./icon')

class Logger {
  constructor(options) {
    this.setOptions(options)
  }

  setOptions(options) {
    this.options = Object.assign({}, this.options, options)
  }

  log(...args) {
    console.log(...args)
  }

  debug(...args) {
    if (!this.options.debug) {
      return
    }
    console.log(chalk.magenta.bold('===>'), ...args.map(str => chalk.bold(str)))
  }

  error(...args) {
    console.error(chalk.red(args.join(' ')))
    process.exitCode = process.exitCode || 1
  }

  success(...args) {
    console.log(icon.success, ...args)
  }
}

module.exports = new Logger()
