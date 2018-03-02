const util = require('util')
const LogHorizon = require('log-horizon')

class Logger extends LogHorizon {
  inspect(title, obj) {
    if (this.options.logLevel < 4) return

    console.log(
      title,
      util.inspect(obj, {
        depth: null,
        colors: true
      })
    )
  }
}

module.exports = new Logger()
