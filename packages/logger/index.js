const util = require('util')
const LogHorizon = require('log-horizon')
const tc = require('turbocolor')

class Logger extends LogHorizon {
  inspect(title, obj) {
    if (this.options.logLevel < 4) return

    return this.debug(
      title,
      util.inspect(obj, {
        depth: null,
        colors: true
      })
    )
  }

  debug(title, message = '') {
    return super.debug(`${tc.inverse.bold.yellow(` ${title} `)} ${message}`)
  }
}

module.exports = new Logger({
  logUpdate: false
})
