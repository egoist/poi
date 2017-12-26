const url = require('url')
const address = require('address')
const copy = require('clipboardy')
const chalk = require('chalk')
const { unspecifiedAddress } = require('../utils')
const logger = require('../logger')
const terminal = require('../terminal-utils')
const handleWebpackErrors = require('./handle-errors')

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
  constructor(opts) {
    this.opts = opts
  }

  apply(compiler) {
    if (this.opts.mode === 'production') {
      compiler.plugin('compile', () => {
        this.clearScreen()
      })
    }

    compiler.plugin('done', stats => {
      this.clearScreen()

      if (stats.hasErrors()) {
        process.exitCode = 1
        if (this.opts.rawErrors) {
          outputStats(stats)
        } else {
          const { errors } = stats.compilation
          handleWebpackErrors(errors)
        }
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
      logger.title('WAIT', 'Compiling...')
      console.log()
    })
  }

  clearScreen() {
    if (this.opts.clear !== false) {
      terminal.clear()
    }
    return this
  }

  displaySuccess(stats) {
    const { host, port, mode } = this.opts

    outputStats(stats)

    console.log()

    if (mode === 'development') {
      const isUnspecifiedAddress = unspecifiedAddress(host)
      const localURL = url.format({
        protocol: 'http',
        hostname: isUnspecifiedAddress ? 'localhost' : host,
        port
      })
      if (this.copied) {
        console.log(chalk.bold(`> Open ${localURL}`))
      } else {
        this.copied = true
        try {
          copy.writeSync(localURL)
          console.log(chalk.bold(`> Open ${localURL}`), chalk.dim('(copied!)'))
        } catch (err) {
          console.log(chalk.bold(`> Open ${localURL}`))
        }
      }
      if (isUnspecifiedAddress) {
        const lanURL = url.format({
          protocol: 'http',
          hostname: this.lanIP || (this.lanIP = address.ip()),
          port
        })
        console.log(chalk.dim(`> On Your Network: ${lanURL}`))
      }
      console.log()
    }

    logger.success(`Build ${chalk.italic(stats.hash.slice(0, 6))} finished in ${stats.endTime - stats.startTime} ms!`)

    console.log()

    process.exitCode = 0
  }
}
