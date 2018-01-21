/* eslint-disable unicorn/no-process-exit */
const util = require('util')
const fs = require('fs')
const url = require('url')
const chalk = require('chalk')
const notifier = require('node-notifier')
const co = require('co')
const stripAnsi = require('strip-ansi')
const tildify = require('tildify')
const merge = require('lodash/merge')
const chokidar = require('chokidar')
const opn = require('opn')
const loadPoiConfig = require('poi-load-config/poi')
const AppError = require('../lib/app-error')
const {
  cwd,
  ownDir,
  unspecifiedAddress,
  readPkg,
  deleteCache,
  arrify,
  localRequire
} = require('../lib/utils')
const poi = require('../lib')
const logger = require('../lib/logger')

module.exports = function (cliOptions) {
  const { inspectOptions } = cliOptions
  deleteExtraOptions(cliOptions, [
    '--',
    'v',
    'version',
    'h',
    'help',
    'inspectOptions',
    'inspect-options'
  ])

  if (!process.env.NODE_ENV) {
    // env could be `production` `development` `test`
    process.env.NODE_ENV =
    cliOptions.mode === 'watch' ? 'development' : cliOptions.mode
  }

  if (cliOptions.require) {
    arrify(cliOptions.require).forEach(m => {
      localRequire(m)
      console.log(`> Required ${m}`)
    })
  }

  console.log(`> Running in ${cliOptions.mode} mode`)

  const start = co.wrap(function * () {
    deleteCache()

    let explictConfigFile = cliOptions.config
    const poiField = readPkg().poi
    if (!explictConfigFile && poiField && typeof poiField === 'string') {
      explictConfigFile = poiField
    }
    let { path: configPath, config } = yield loadPoiConfig({
      config: explictConfigFile
    })

    // Config might be `undefined` if `package.json` was found
    // But there's no `poi` key
    if (configPath && config !== undefined) {
      console.log(`> Using external Poi config file`)
      console.log(chalk.dim(`> location: "${tildify(configPath)}"`))
      config = config.default || config
      config = handleConfig(config, cliOptions)
    } else if (explictConfigFile) {
      throw new AppError(`Config file was not found at ${explictConfigFile}!`)
    }

    const app = poi(merge(config, cliOptions))

    console.log(
      `> Bundling with Webpack ${require('webpack/package.json').version}`
    )

    const { options } = app
    if (inspectOptions) {
      console.log(
        '> Options:',
        util.inspect(options, { colors: true, depth: null })
      )
    }

    const watchFiles = ({ server, webpackWatcher }) => {
      const filesToWatch = []
        .concat(configPath || [])
        .concat(options.restartOnFileChanges || [])
        .filter(v => typeof v === 'string')
      if (
        filesToWatch.length > 0 &&
        options.restartOnFileChanges !== false &&
        (options.mode === 'development' ||
          options.mode === 'watch' ||
          cliOptions.watch)
      ) {
        const watcher = chokidar.watch(filesToWatch)
        watcher.on('change', changed => {
          console.log(
            chalk.yellow(
              `> Restarting due to file changes: ${tildify(changed)}`
            )
          )
          watcher.close()
          if (server) {
            server.close(() => start().catch(handleError))
          } else if (webpackWatcher) {
            webpackWatcher.close()
            start().catch(handleError)
          }
        })
      }
    }

    // Handle different modes
    if (options.mode === 'production') {
      console.log('> Creating an optimized production build:\n')
      const stats = yield app.build()
      if (options.generateStats) {
        const statsFile = cwd(
          options.cwd,
          typeof options.generateStats === 'string' ?
            options.generateStats :
            'stats.json'
        )
        console.log('> Generating webpack stats file')
        fs.writeFileSync(statsFile, JSON.stringify(stats.toJson()), 'utf8')
        console.log(chalk.dim(`> location: "${tildify(statsFile)}"`))
      }
    } else if (options.mode === 'watch') {
      const webpackWatcher = yield app.watch()
      watchFiles({ webpackWatcher })
    } else if (options.mode === 'development') {
      const { server, host, port } = yield app.dev()

      server.listen(port, host).on('error', err => {
        if (err.code === 'EADDRINUSE') {
          return handleError(
            new AppError(
              `Port ${port} is already in use.\n\nYou can use another one by adding \`--port <port>\` or set it in config file.`
            )
          )
        }
        handleError(err)
      })

      app.once('compile-done', () => {
        if (options.open) {
          opn(
            url.format({
              protocol: 'http',
              hostname: unspecifiedAddress(host) ? 'localhost' : host,
              port
            })
          )
        }
      })

      watchFiles({ server })
    } else if (typeof options.mode === 'string') {
      yield app.prepare()
      yield app.runMiddlewares()
      if (app.middlewares.length === 0) {
        console.log('> Please use this command with Poi presets')
      }
    }
  })

  return start()
}

module.exports.handleError = handleError

function handleError(err) {
  console.log()
  if (err.name === 'AppError') {
    console.error(chalk.red(err.message))
  } else {
    console.error(err.stack.trim())
  }
  notifier.notify({
    title: 'Poi: error!',
    message: stripAnsi(err.stack).replace(/^\s+/gm, ''),
    icon: ownDir('bin/error.png')
  })
  console.log()
  logger.error('Failed to start!')
  console.log()
  process.exit(1)
}

function handleConfig(config, options) {
  if (typeof config === 'function') {
    config = config(options, require)
  }

  config = merge(config, config[options.mode])

  delete config.development
  delete config.production
  delete config.watch
  delete config.test

  return config
}

function deleteExtraOptions(obj, arr) {
  arr.forEach(k => delete obj[k])
}
