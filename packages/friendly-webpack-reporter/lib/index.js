const path = require('path')
const textTable = require('text-table')
const bytes = require('bytes')
const chalk = require('chalk')
const transformer = require('./transformer')
const formater = require('./formater')

module.exports = class FriendlyWebpackReporter {
  constructor({ logger, showFileStats, clearConsole, showCompiledIn = true }) {
    this.logger = logger
    this.showFileStats = showFileStats
    this.shouldClearConsole = clearConsole
    this.showCompiledIn = showCompiledIn
  }

  apply(compiler) {
    if (compiler.hooks) {
      compiler.hooks.done.tap('FriendlyWebpackReporter', this.handle.bind(this))
    } else {
      compiler.plugin('done', this.handle.bind(this))
    }
  }

  handle(stats) {
    if (stats.hasErrors()) {
      return this.displayErrors(stats, 'error')
    }
    if (stats.hasWarnings()) {
      return this.displayErrors(stats, 'warning')
    }
    return this.displaySuccess(stats)
  }

  async displayErrors(stats, type = 'error') {
    this.clearConsole()

    const source =
      type === 'error' ? stats.compilation.errors : stats.compilation.warnings

    if (type === 'error') {
      this.logger.error(
        chalk.red(`Failed to compile with ${source.length} errors\n`)
      )
    } else if (type === 'warning') {
      this.logger.warn(
        chalk.yellow(`Compiled with ${source.length} warnings\n`)
      )
    }

    await Promise.all(
      source.map(async v => {
        const transformed = transformer(v)
        const message = await formater(transformed)
        this.logger.log(message + '\n')
      })
    )
  }

  displaySuccess(stats) {
    this.clearConsole()
    if (this.showCompiledIn) {
      this.logger.success(
        chalk.green(
          `Compiled successfully in ${stats.endTime - stats.startTime} ms!`
        )
      )
    }
    if (this.showFileStats) {
      console.log(
        '\n' +
          textTable(
            stats.toJson().assets.map(asset => {
              return [
                `${chalk.dim(
                  `${path.relative(
                    process.cwd(),
                    stats.compilation.compiler.options.output.path
                  )}/`
                )}${chalk.green(asset.name)}`,
                chalk[asset.isOverSizeLimit ? 'red' : 'cyan'](
                  bytes(asset.size, { unitSeparator: ' ' })
                )
              ]
            })
          )
      )
    }
  }

  clearConsole() {
    if (this.shouldClearConsole !== false && process.stdout.isTTY) {
      // Soft clear, i.e. allow scroll back
      process.stdout.write('\x1Bc')
    }
  }
}
