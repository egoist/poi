'use strict'
const chalk = require('chalk')

module.exports = function (options) {
  const mode =
    options.electron
      ? 'Electron mode'
      : options.cjs
      ? 'CommonJS mode'
      : typeof options.umd === 'string'
      ? 'UMD mode'
      : 'IIFE mode'
   return chalk.gray(` (${mode})`)
}
