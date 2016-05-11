'use strict'
module.exports = function (options) {
  const modes = []
  if (options.electron) {
    modes.push('Electron')
  }
  if (options.watch) {
    modes.push('Watch')
  }
  if (options.cjs) {
    modes.push('CommonJS')
  } else if (typeof options.umd === 'string') {
    modes.push('UMD')
  } else {
    modes.push('IIFE')
  }
  return modes.join(', ')
}
