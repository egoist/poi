const url = require('url')
const address = require('address')
const colors = require('./colors')
const prettyBytes = require('./prettyBytes')

module.exports = ({
  https,
  host,
  port,
  expectedPort,
  open,
  isFirstBuild,
  publicUrl
}) => {
  const ip = address.ip()

  const protocol = https ? 'https' : 'http'
  const isUnspecifiedHost = host === '0.0.0.0' || host === '::'
  const prettyHost = isUnspecifiedHost ? 'localhost' : host
  const { heapUsed } = process.memoryUsage()

  const urlPort = colors.bold(port)
  const urlPath = publicUrl === '/' ? '' : url.resolve('/', publicUrl)

  console.log()
  console.log(
    `Local:             ${protocol}://${prettyHost}:${urlPort}${urlPath}`
  )
  console.log(`On Your Network:   ${protocol}://${ip}:${urlPort}${urlPath}`)
  console.log()
  if (expectedPort && expectedPort !== port) {
    console.log(colors.yellow(`> port ${expectedPort} is used!`))
  }
  console.log(colors.dim(`> ${prettyBytes(heapUsed)} memory used`))
  console.log()

  if (open && isFirstBuild) {
    require('./openBrowser')(`${protocol}://${prettyHost}:${port}${urlPath}`)
  }
}
