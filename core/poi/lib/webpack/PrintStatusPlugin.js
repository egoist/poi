const path = require('path')
const chalk = require('chalk')
const textTable = require('text-table')
const gzipSize = require('gzip-size')
const formatWebpackMessages = require('@poi/dev-utils/formatWebpackMessages')
const logger = require('@poi/logger')
const prettyBytes = require('../utils/prettyBytes')

class PrintStatusPlugin {
  constructor(opts = {}) {
    this.opts = opts
  }

  apply(compiler) {
    compiler.hooks.done.tapPromise('print-status', async stats => {
      if (this.opts.clearConsole !== false) {
        require('@poi/dev-utils/clearConsole')()
      }
      if (stats.hasErrors() || stats.hasWarnings()) {
        if (stats.hasErrors()) {
          process.exitCode = 1
        }
        // Print prettified errors and warnings
        const messages = formatWebpackMessages(stats.toJson())
        if (messages) {
          const { errors, warnings } = messages
          for (const error of errors) {
            console.error(error)
          }
          for (const warning of warnings) {
            console.error(warning)
          }
        }
        // Print full stats in debug mode
        logger.debug(() =>
          stats.toString({
            colors: true
          })
        )
      } else {
        logger.done(`Build completed in ${stats.endTime - stats.startTime} ms`)
        // Print file stats
        if (
          (this.opts.printFileStats || logger.options.debug) &&
          !process.env.CI
        ) {
          logger.log()
          const assets = await Promise.all(
            stats.toJson().assets.map(async asset => {
              asset.gzipped = await gzipSize(
                stats.compilation.assets[asset.name].source()
              )
              return asset
            })
          )
          const data = assets.map(asset => {
            const filename = path.relative(
              process.cwd(),
              path.join(compiler.options.output.path, asset.name)
            )
            return [
              path.join(
                path.dirname(filename),
                chalk.bold(path.basename(filename))
              ),
              chalk.green(prettyBytes(asset.size)),
              chalk.green(prettyBytes(asset.gzipped))
            ]
          })
          data.unshift([
            chalk.bold('file'),
            chalk.bold('size'),
            chalk.bold('gzipped')
          ])
          data.push([
            '(total)',
            chalk.green(
              prettyBytes(
                assets.reduce((result, asset) => result + asset.size, 0)
              )
            ),
            chalk.green(
              prettyBytes(
                assets.reduce((result, asset) => result + asset.gzipped, 0)
              )
            )
          ])
          logger.log(
            textTable(data, {
              stringLength: require('string-width')
            })
          )
        }
      }
    })
  }
}

module.exports = PrintStatusPlugin
