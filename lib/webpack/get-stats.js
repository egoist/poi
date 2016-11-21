'use strict'
const chalk = require('chalk')
const timestamp = require('time-stamp')

function getTimestamp() {
  return `[${chalk.yellow(timestamp('HH:mm:ss'))}]`
}

module.exports = stats => {
  const durations = stats.endTime - stats.startTime
  const formatedDurations = chalk.magenta(durations >= 1000 ? `${durations / 1000} s` : `${durations} ms`)
  const successMessage = `\n\n${getTimestamp()} Completed in ${formatedDurations}\n`
  const errorMessage = `\n\n${getTimestamp()} Failed in ${formatedDurations}\n`

  if (stats.hasErrors() || stats.hasWarnings()) {
    process.exitCode = 1
    return stats.toString('errors-only').trim() + errorMessage
  }
  return stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,
    hash: false,
    version: false,
    timings: false
  }) + successMessage
}
