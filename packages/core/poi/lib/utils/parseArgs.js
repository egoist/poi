module.exports = _args => {
  const args = _args.reduce((res, arg) => {
    return res.concat(
      arg.startsWith('-') && arg.includes('=') ? arg.split('=') : arg
    )
  }, [])

  return {
    getValue(name) {
      if (!this.has(name)) return

      const index = args.indexOf(name.length === 1 ? `-${name}` : `--${name}`)
      return args[index + 1]
    },

    has(name) {
      if (name.length > 1) {
        return args.includes(`--${name}`)
      }

      const RE = new RegExp(`^-([a-zA-Z]+)`)
      return args.find(arg => {
        return RE.test(arg) && RE.exec(arg)[1].includes(name)
      })
    }
  }
}
