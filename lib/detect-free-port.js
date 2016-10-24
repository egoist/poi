'use strict'
const co = require('co')
const detect = require('detect-port')
const chalk = require('chalk')
const terminalUtils = require('./terminal-utils')

module.exports = co.wrap(function* (DEFAULT_PORT) {
  let port = yield detect(DEFAULT_PORT)

  if (port === DEFAULT_PORT) return port

  terminalUtils.clearConsole()

  let question =
    chalk.yellow(`Something is already running on port ${DEFAULT_PORT}.`) +
    '\n\nWould you like to run the app on another port instead?'

  let shouldChangePort = yield terminalUtils.prompt(question, true)

  return shouldChangePort ? port : null
})
