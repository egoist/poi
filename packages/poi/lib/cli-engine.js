const cac = require('cac')

// The CLI engine is only responsible for running command and disable help
// The actuall cli args are parsed in bin/main.js ahead of this
module.exports = class CLI {
  constructor(command) {
    this.command = command
    this.cac = cac()
  }

  handleCommand(...args) {
    return this.cac.command(...args)
  }

  async runCommand() {
    return this.cac.parse([this.command])
  }
}
