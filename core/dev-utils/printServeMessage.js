const chalk = require('chalk')
const address = require('address')

module.exports = ({ host, port, open, isFirstBuild }) => {
  const ip = address.ip()

  const isUnspecifiedHost = host === '0.0.0.0' || host === '::'
  const prettyHost = isUnspecifiedHost ? 'localhost' : host

  console.log()
  console.log(`Local:             http://${prettyHost}:${chalk.bold(port)}`)
  console.log(`On Your Network:   http://${ip}:${chalk.bold(port)}`)
  console.log()

  if (open && isFirstBuild) {
    require('./openBrowser')(`http://${prettyHost}:${port}`)
  }
}
