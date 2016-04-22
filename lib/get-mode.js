'use strict'
const chalk = require('chalk')

module.exports = function (options) {
  const modes = []
  if (options.electron) {
    modes.push('Electron')
  }
  if (options.cjs) {
    modes.push('CommonJS')
  } else if (typeof options.umd === 'string') {
    modes.push('UMD')
  } else {
    modes.push('IIFE')
  }
  return chalk.gray(` (${modes.join(', ')} mode)`)
}
