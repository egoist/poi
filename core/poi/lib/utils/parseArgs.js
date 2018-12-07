const cac = require('cac')

module.exports = _args => {
  const cli = cac()
  const { options } = cli.parse(_args)

  return {
    get(name) {
      return options[name]
    },

    has(name) {
      return this.get(name) !== undefined
    }
  }
}
