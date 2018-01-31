const url = require('url')
const address = require('address')
const copy = require('clipboardy')
const chalk = require('chalk')
const terminal = require('../terminal-utils')
const emoji = require('../emoji')

function outputStats(stats) {
  console.log(stats.toString({
    colors: true,
    chunks: false,
    modules: false,
    children: false,
    version: false,
    hash: false,
    timings: false
  }))
}

module.exports = class FancyLogPlugin {
  constructor(logger, opts) {
    this.opts = opts
    this.logger = logger
  }

  apply(compiler) {
    if (this.opts.command === 'build') {
      compiler.plugin('compile', () => {
        this.clearScreen()
      })
    }

    compiler.plugin('done', stats => {
      this.clearScreen()

      if (stats.hasErrors()) {
        process.exitCode = 1
        outputStats(stats)
        console.log()
        this.logger.error('Compiled with errors!')
        console.log()
        return
      }

      if (stats.hasWarnings()) {
        process.exitCode = 1
        outputStats(stats)
        console.log()
        this.logger.error('Compiled with warnings!')
        console.log()
        return
      }

      this.displaySuccess(stats)
    })

    compiler.plugin('invalid', () => {
      this.clearScreen()
      this.logger.status(emoji.progress, 'Compiling...')
      console.log()
    })
  }

  clearScreen() {
    if (this.opts.clearScreen !== false) {
      terminal.clear()
    }
    return this
  }

  displaySuccess(stats) {
    this.logger.status(emoji.success, chalk.green(`Built in ${stats.endTime - stats.startTime}ms.`))
    process.exitCode = 0
  }
}
