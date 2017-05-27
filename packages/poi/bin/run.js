/* eslint-disable unicorn/no-process-exit */
const util = require('util')
const fs = require('fs')
const url = require('url')
const chalk = require('chalk')
const notifier = require('node-notifier')
const co = require('co')
const stripAnsi = require('strip-ansi')
const tildify = require('tildify')
const address = require('address')
const merge = require('lodash.merge')
const copy = require('clipboardy')
const opn = require('opn')
const buildConfigChain = require('babel-core/lib/transformation/file/options/build-config-chain')
const LoadExternalConfig = require('poi-load-config')
const loadPoiConfig = require('poi-load-config/poi')
const AppError = require('../lib/app-error')
const { cwd, ownDir, inferHTML, readPkg } = require('../lib/utils')
const poi = require('../lib')
const terminal = require('../lib/terminal-utils')
const logger = require('../lib/logger')

const unspecifiedAddress = host => host === '0.0.0.0' || host === '::'

module.exports = co.wrap(function * (cliOptions) {
  console.log(`> Running in ${cliOptions.mode} mode`)

  let { path: configPath, config = {} } = yield loadPoiConfig({ config: cliOptions.config })

  if (configPath) {
    console.log(`> Using external Poi config file`)
    console.log(chalk.dim(`> location: "${tildify(configPath)}"`))
    config = handleConfig(config, cliOptions)
  } else if (cliOptions.config) {
    throw new AppError('Config file was not found!')
  }

  const options = merge(config, cliOptions)

  const clear = () => options.clear !== false && terminal.clear()

  const printStats = stats => {
    clear()
    if (stats.hasErrors() || stats.hasWarnings()) {
      console.log(stats.toString('errors-only').trim())
      process.exitCode = 1
    } else {
      console.log(stats.toString({
        colors: true,
        chunks: false,
        modules: false,
        children: false,
        version: false,
        hash: false,
        timings: false
      }))
      process.exitCode = 0
    }
  }

  let copied
  let lanIP

  const printOutro = (stats, host, port) => {
    console.log()
    if (stats.hasErrors()) {
      logger.error('Compiled with Errors!')
    } else if (stats.hasWarnings()) {
      logger.warn('Compiled with Warnings!')
    } else {
      if (options.mode === 'development') {
        const isUnspecifiedAddress = unspecifiedAddress(host)
        const localURL = url.format({
          protocol: 'http',
          hostname: isUnspecifiedAddress ? 'localhost' : host,
          port
        })
        if (copied) {
          console.log(chalk.bold(`> Open ${localURL}`))
        } else {
          copied = true
          try {
            copy.writeSync(localURL)
            console.log(chalk.bold(`> Open ${localURL}`), chalk.dim('(copied!)'))
          } catch (err) {
            console.log(chalk.bold(`> Open ${localURL}`))
          }
        }
        if (isUnspecifiedAddress) {
          const lanURL = url.format({
            protocol: 'http',
            hostname: lanIP || (lanIP = address.ip()),
            port
          })
          console.log(chalk.dim(`> On Your Network: ${lanURL}`))
        }
        console.log()
      }
      logger.success(`Build ${stats.hash.slice(0, 6)} finished in ${stats.endTime - stats.startTime} ms!`)
    }
    console.log()
  }

  const loadExternalConfig = new LoadExternalConfig({ cwd: options.cwd })

  if (options.babel === undefined) {
    const { useConfig, file } = yield loadExternalConfig.babel(buildConfigChain)
    if (useConfig) {
      console.log('> Using external babel configuration')
      console.log(chalk.dim(`> location: "${tildify(file)}"`))
      options.babel = {
        cacheDirectory: true,
        babelrc: true
      }
    } else {
      options.babel = {
        cacheDirectory: true,
        babelrc: false
      }
    }
    if (options.babel.babelrc === false) {
      // Use our default preset when no babelrc was found
      options.babel.presets = [
        [require.resolve('babel-preset-vue-app'), { useBuiltIns: true }]
      ]
    }
  }

  if (options.postcss === undefined) {
    const postcssConfig = yield loadExternalConfig.postcss()
    if (postcssConfig.file) {
      console.log('> Using extenal postcss configuration')
      console.log(chalk.dim(`> location: "${tildify(postcssConfig.file)}"`))
      options.postcss = postcssConfig
    }
  }

  if (options.html === undefined) {
    console.log(`> Using inferred value from package.json for HTML file`)
    options.html = inferHTML(options)
  }

  if (options.entry === undefined) {
    const mainField = readPkg().main
    if (mainField) {
      console.log(`> Using main field in package.json as entry point`)
      options.entry = mainField
    }
  }

  if (options.homepage === undefined && options.mode === 'production') {
    options.homepage = readPkg().homepage
  }

  const { browserslist = ['ie > 8', 'last 2 versions'] } = readPkg()

  options.autoprefixer = Object.assign({
    browsers: browserslist
  }, options.autoprefixer)

  deleteExtraOptions(options, [
    '_',
    '$0',
    'inspectOptions',
    'inspect-options',
    'v',
    'version',
    'h',
    'help'
  ])

  if (cliOptions.inspectOptions) {
    console.log('> Options:', util.inspect(options, { colors: true, depth: null }))
  }

  const app = poi(options)

  console.log(`> Bundling with Webpack ${require('webpack/package.json').version}`)

  if (options.mode === 'production') {
    clear()
    console.log('> Creating an optimized production build:\n')
    const stats = yield app.build()
    printStats(stats)
    printOutro(stats)
    if (options.generateStats) {
      const statsFile = cwd(options.cwd, typeof options.generateStats === 'string' ? options.generateStats : 'stats.json')
      console.log('> Generating webpack stats file')
      fs.writeFileSync(statsFile, JSON.stringify(stats.toJson()), 'utf8')
      console.log(chalk.dim(`> location: "${tildify(statsFile)}"`))
    }
  } else if (options.mode === 'watch') {
    yield app.watch()
    app.once('compile-done', () => {
      console.log()
    })
    app.on('compile-done', stats => {
      printStats(stats)
      printOutro(stats)
    })
  } else if (options.mode === 'development') {
    const { server, host, port } = yield app.dev()

    server.listen(port, host)
    .on('error', err => {
      if (err.code === 'EADDRINUSE') {
        return handleError(new AppError(`Port ${port} is already in use.\n\nYou can use another one by adding \`--port <port>\` or set it in config file.`))
      }
      handleError(err)
    })

    app.once('compile-done', () => {
      if (options.open) {
        opn(url.format({
          protocol: 'http',
          hostname: unspecifiedAddress(host) ? 'localhost' : host,
          port
        }))
      }
    })

    app.on('compile-done', stats => {
      printStats(stats)
      printOutro(stats, host, port)
    })
  } else if (options.mode === 'test') {
    app.test().catch(handleError)
  }
})

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
