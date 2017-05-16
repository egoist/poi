/* eslint-disable unicorn/no-process-exit */
const fs = require('fs')
const url = require('url')
const chalk = require('chalk')
const notifier = require('node-notifier')
const co = require('co')
const stripAnsi = require('strip-ansi')
const tildify = require('tildify')
const address = require('address')
const merge = require('lodash.merge')
const findBabelConfig = require('babel-load-config')
const findPostcssConfig = require('postcss-load-config')
const copy = require('clipboardy')
const opn = require('opn')
const AppError = require('../lib/app-error')
const { cwd, ownDir, inferHTML, readPkg, parsePresets } = require('../lib/utils')
const loadConfig = require('../lib/load-config')
const poi = require('../lib')
const terminal = require('../lib/terminal-utils')
const logger = require('../lib/logger')

const unspecifiedAddress = host => host === '0.0.0.0' || host === '::'

const loadPostCSSConfig = co.wrap(function * () {
  let defaultPostcssOptions = {}
  try {
    defaultPostcssOptions = yield findPostcssConfig({}, null, { argv: false })
      .then(res => {
        console.log('> Using extenal postcss configuration')
        console.log(chalk.dim(`> location: "${tildify(res.file)}"`))
        return res
      })
  } catch (err) {
    if (err.message.indexOf('No PostCSS Config found') === -1) {
      throw err
    }
  }

  return defaultPostcssOptions
})

const loadBabelConfig = function () {
  const defaultBabelOptions = {
    babelrc: true,
    cacheDirectory: true
  }

  const externalBabelConfig = findBabelConfig(process.cwd())
  if (externalBabelConfig) {
    console.log('> Using external babel configuration')
    console.log(chalk.dim(`> location: "${tildify(externalBabelConfig.loc)}"`))
    // It's possible to turn off babelrc support via babelrc itself.
    // In that case, we should add our default preset.
    // That's why we need to do this.
    const { options } = externalBabelConfig
    defaultBabelOptions.babelrc = options.babelrc !== false
  } else {
    defaultBabelOptions.babelrc = false
  }

  // Add our default preset if the no "babelrc" found.
  if (!defaultBabelOptions.babelrc) {
    defaultBabelOptions.presets = [
      [require.resolve('babel-preset-vue-app'), {
        useBuiltIns: true
      }]
    ]
  }

  return defaultBabelOptions
}

module.exports = co.wrap(function * (cliOptions) {
  console.log(`> Running in ${cliOptions.mode} mode`)

  const config = yield loadConfig(cliOptions)
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

  if (options.presets) {
    options.presets = parsePresets(options.presets)
  }

  if (options.babel === undefined) {
    options.babel = loadBabelConfig()
  }

  if (options.postcss === undefined) {
    options.postcss = yield loadPostCSSConfig()
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
