const chalk = require('chalk')

module.exports = class CompilePlugin {
  constructor({port, host, open} = {}) {
    this.host = host
    this.port = port
    this.open = open
  }

  apply(compiler) {
    compiler.plugin('done', () => {
      const url = `http://${this.host}:${this.port}`
      console.log(`> Running on ${url}`)
      if (this.host === '0.0.0.0') {
        console.log(chalk.dim(`To visit it on other device, connect your devices to the same network and open http://${require('internal-ip').v4()}:${port}`))
      }
      if (this.open) {
        require('opn')(url)
      }
    })
  }
}
