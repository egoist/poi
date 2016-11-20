'use strict'
const logUpdate = require('log-update')
const getStats = require('../get-stats')

module.exports = class DisplayStats {
  apply(compiler) {
    const production = process.env.NODE_ENV === 'production'
    const log = production ? console.log.bind(console) : logUpdate
    compiler.plugin('compile', () => {
      if (!production) {
        log('> Building...')
      }
    })
    compiler.plugin('done', stats => {
      if (production) {
        process.stdout.clearLine()
        process.stdout.write('\r')
      }
      log(getStats(stats))
    })
  }
}

