const logUpdate = require('log-update')
const chalk = require('chalk')
const emoji = require('./emoji')

class Logger {
  constructor(options) {
    if (options) {
      this.setOptions(options)
    }
  }

  setOptions({ logLevel, debug, silly, quiet, useLogUpdate } = {}) {
    if (debug) {
      logLevel = 4
    } else if (quiet) {
      logLevel = 1
    } else if (silly) {
      logLevel = 5
    }
    this.logLevel = typeof logLevel === 'number' ? logLevel : 3
    this.useLogUpdate = typeof useLogUpdate === 'boolean' ? useLogUpdate : true
  }

  clear() {
    if (this.useLogUpdate) {
      logUpdate.clear()
    }
  }

  write(message, persistent = false) {
    if (persistent) {
      this.clear()
      console.log(message)
      return
    }
    if (this.useLogUpdate) {
      logUpdate(message)
    } else {
      console.log(message)
    }
  }

  // Debug message
  // Always persisted
  debug(title, message) {
    if (this.logLevel < 4) {
      return
    }

    this.write(`${chalk.bold(title)} ${chalk.dim(message)}`, true)
  }

  // Like debug for even more debug...
  silly(title, message) {
    if (this.logLevel < 5) {
      return
    }

    this.write(`${chalk.bold(title)} ${chalk.dim(message)}`, true)
  }

  // Normal log
  // Persist by default
  log(message, update) {
    if (this.logLevel < 3) {
      return
    }

    this.write(message, !update)
  }

  // Warn status
  warn(message) {
    if (this.logLevel < 2) {
      return
    }

    this.status(emoji.warning, message)
  }

  // Error status
  error(err) {
    if (this.logLevel < 1) {
      return
    }

    // TODO: handle error class too
    return this.status(emoji.error, err)
  }

  // Status message should be persisted
  // Unless `update` is set
  // Mainly used in `progress-plugin.js`
  status(emoji, message, update) {
    if (this.logLevel < 3) {
      return
    }

    if (update && this.useLogUpdate) {
      return logUpdate(`${emoji}  ${message}`)
    }

    this.clear()
    console.log(`${emoji}  ${message}`)
  }
}

module.exports = new Logger()
