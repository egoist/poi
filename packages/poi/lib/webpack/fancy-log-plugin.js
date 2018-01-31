const chalk = require('chalk')
const terminal = require('../terminal-utils')
const emoji = require('../emoji')
const logger = require('../logger')

function outputStats(stats) {
  console.log(
    stats.toString({
      colors: true,
      chunks: false,
      modules: false,
      children: false,
      version: false,
      hash: false,
      timings: false
    })
  )
}

module.exports = class FancyLogPlugin {
  constructor(opts) {
    this.opts = opts
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
        logger.error('Compiled with errors!')
        console.log()
        return
      }

      if (stats.hasWarnings()) {
        process.exitCode = 1
        outputStats(stats)
        console.log()
        logger.error('Compiled with warnings!')
        console.log()
        return
      }

      this.displaySuccess(stats)
    })

    compiler.plugin('invalid', () => {
      this.clearScreen()
      logger.status(emoji.progress, 'Compiling...')
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
    logger.status(
      emoji.success,
      chalk.green(`Built in ${stats.endTime - stats.startTime}ms.`)
    )
    process.exitCode = 0
  }
}
