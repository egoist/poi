const cac = require('cac')
const chokidar = require('chokidar')
const Poi = require('../lib')
const emoji = require('../lib/emoji')
const isPath = require('../lib/utils/isPath')
const logger = require('../lib/logger')

const { input, flags } = cac.parse(process.argv.slice(2))

let command
let entry
if (!input[0] || isPath(input[0])) {
  command = 'develop'
  entry = input
} else {
  command = input[0]
  entry = input.slice(1)
}

const options = {
  ...flags,
  entry
}

if (entry.length === 0) {
  delete options.entry
}

const watchRun = (app, { devServer, webpackWatcher } = {}) => {
  if (app.options.restartOnFileChanges === false) return
  if (!['watch', 'develop'].includes(app.command) && !app.options.watch) return

  const filesToWatch = [
    ...[].concat(app.configFile || ['poi.config.js', '.poirc']),
    ...[].concat(app.options.restartOnFileChanges || [])
  ]

  logger.debug('Watching files', filesToWatch)

  const watcher = chokidar.watch(filesToWatch, {
    ignoreInitial: true
  })
  const handleEvent = filepath => {
    logger.status(
      emoji.progress,
      `Restarting due to changes made in: ${filepath}`
    )
    watcher.close()
    if (devServer) {
      devServer.close(main)
    } else if (webpackWatcher) {
      webpackWatcher.close()
      main()
    }
  }
  watcher.on('change', handleEvent)
  watcher.on('add', handleEvent)
  watcher.on('unlink', handleEvent)
}

const handleError = err => {
  console.error(err.stack)
  process.exit(1)
}

async function main() {
  try {
    const app = new Poi(command, options)
    watchRun(app, await app.run())
  } catch (err) {
    handleError(err)
  }
}

main()
