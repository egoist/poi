const url = require('url')
const address = require('address')
const colors = require('./colors')
const prettyBytes = require('./prettyBytes')

module.exports = ({
  host,
  port,
  expectedPort,
  open,
  isFirstBuild,
  publicUrl
}) => {
  const ip = address.ip()

  const isUnspecifiedHost = host === '0.0.0.0' || host === '::'
  const prettyHost = isUnspecifiedHost ? 'localhost' : host
  const { heapUsed } = process.memoryUsage()

  const urlPort = colors.bold(port)
  const urlPath = url.resolve('/', publicUrl).replace(/\/$/, '')

  console.log()
  console.log(`Local:             http://${prettyHost}:${urlPort}${urlPath}`)
  console.log(`On Your Network:   http://${ip}:${urlPort}${urlPath}`)
  console.log()
  if (expectedPort && expectedPort !== port) {
    console.log(colors.yellow(`> port ${expectedPort} is used!`))
  }
  console.log(colors.dim(`> ${prettyBytes(heapUsed)} memory used`))
  console.log()

  if (open && isFirstBuild) {
    require('./openBrowser')(`http://${prettyHost}:${port}`)
  }
}
