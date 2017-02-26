#!/usr/bin/env node
const chalk = require('chalk')
const chokidar = require('chokidar')
const notifier = require('node-notifier')
const co = require('co')
const stripAnsi = require('strip-ansi')
const AppError = require('../lib/app-error')
const {getConfigFile, ownDir} = require('../lib/utils')

const main = require('../lib')

module.exports = function (options) {
  const start = co.wrap(function * () {
    const result = yield main(options)

    const {host, port, open} = result.options
    const {server, devMiddleWare} = result

    if (server) {
      server.listen(port, host, () => {
        if (open) {
          require('opn')(`http://${host}:${port}`)
        }
      })
      .on('error', err => {
        if (err.code === 'EADDRINUSE') {
          return handleError(new AppError(`Port ${port} is already in use.\n\nYou can use another one by adding \`--port <port>\` or set it in config file.`))
        }
        handleError(err)
      })
    }

    // watch config file
    if (options.config !== false && (options.dev || options.watch)) {
      const configFile = getConfigFile(options.config)
      if (configFile) {
        let watcher = chokidar.watch(configFile)

        watcher.on('change', filename => {
          if (!result) {
            return
          }

          // server in dev mode
          if (server) {
            server.close()
            devMiddleWare.close()
          }

          // watcher for webpack in watch mode
          if (result.watcher) {
            result.watcher.close()
          }

          // watcher for config file
          if (watcher) {
            watcher.close()
            watcher = null
          }

          console.log(`> Detect changes from ${chalk.yellow(filename)}, restarting...\n`)
          start().catch(handleError)
        })
      }
    }
  })

  start().catch(handleError)
}

function handleError(err) {
  process.stdout.write('\x1Bc')
  console.error(`${chalk.bgRed.black(' ERROR ')} Something went wrong during the build:\n`)
  if (err.name === 'AppError') {
    console.error(chalk.red(err.message))
  } else {
    console.error(err.stack)
  }
  notifier.notify({
    title: 'build failed!',
    message: stripAnsi(err.stack).replace(/^\s+/gm, ''),
    icon: ownDir('lib/icon.png')
  })
  console.log()
  process.exit(1)
}
