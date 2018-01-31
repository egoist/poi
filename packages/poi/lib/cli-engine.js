const cac = require('cac')

module.exports = class CLI {
  constructor(command) {
    this.cac = cac()
  }

  registerCommand(...args) {
    return this.cac.command(...args)
  }

  async runCommand() {
    return this.cac.parse()
  }
}
