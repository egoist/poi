const address = require('address')
const colors = require('./colors')

module.exports = ({ host, port, open, isFirstBuild }) => {
  const ip = address.ip()

  const isUnspecifiedHost = host === '0.0.0.0' || host === '::'
  const prettyHost = isUnspecifiedHost ? 'localhost' : host

  console.log()
  console.log(`Local:             http://${prettyHost}:${colors.bold(port)}`)
  console.log(`On Your Network:   http://${ip}:${colors.bold(port)}`)
  console.log()

  if (open && isFirstBuild) {
    require('./openBrowser')(`http://${prettyHost}:${port}`)
  }
}
