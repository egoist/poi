const path = require('path')
const textTable = require('text-table')
const chalk = require('chalk')
const bytes = require('bytes')

module.exports = class ReportStatusPlugin {
  constructor(options) {
    this.options = options
  }

  apply(compiler) {
    compiler.hooks.done.tap('report-status', stats => {
      if (stats.hasErrors() || stats.hasWarnings()) {
        console.log(
          stats.toString({
            colors: true,
            assets: false,
            chunks: false,
            modules: false,
            version: false,
            hash: false,
            children: false,
            timings: false,
            builtAt: false
          })
        )
      } else if (this.options.command === 'build') {
        console.log(
          textTable(
            stats.toJson().assets.map(asset => {
              return [
                `${chalk.dim(
                  `${path.relative(
                    process.cwd(),
                    compiler.options.output.path
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
    })
  }
}
