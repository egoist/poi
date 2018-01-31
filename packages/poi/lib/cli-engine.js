const cac = require('cac')

class Command {
  constructor(name, options) {
    const command = {
      ...options,
      name,
      alias: option.alias || [],
      desc: option.desc
    }
    this.command = command
    this.options = new Map()
  }

  option(name, options) {
    this.options.set(name, options)
  }
}

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
