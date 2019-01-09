const address = require('address')
const colors = require('./colors')
const prettyBytes = require('./prettyBytes')

module.exports = ({ host, port, open, isFirstBuild }) => {
  const ip = address.ip()

  const isUnspecifiedHost = host === '0.0.0.0' || host === '::'
  const prettyHost = isUnspecifiedHost ? 'localhost' : host
  const { heapUsed } = process.memoryUsage()

  console.log()
  console.log(`Local:             http://${prettyHost}:${colors.bold(port)}`)
  console.log(`On Your Network:   http://${ip}:${colors.bold(port)}`)
  console.log()
  console.log(colors.dim(`(${prettyBytes(heapUsed)} memory used)`))
  console.log()

  if (open && isFirstBuild) {
    require('./openBrowser')(`http://${prettyHost}:${port}`)
  }
}
