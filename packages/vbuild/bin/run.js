/* eslint-disable unicorn/no-process-exit */
const fs = require('fs')
const chalk = require('chalk')
const notifier = require('node-notifier')
const co = require('co')
const stripAnsi = require('strip-ansi')
const tildify = require('tildify')
const merge = require('lodash.merge')
const findBabelConfig = require('babel-load-config')
const findPostcssConfig = require('postcss-load-config')
const copy = require('clipboardy')
const opn = require('opn')
const req = require('req-cwd')
const AppError = require('../lib/app-error')
const { cwd, ownDir, inferHTML, readPkg } = require('../lib/utils')
const loadConfig = require('../lib/load-config')
const vbuild = require('../lib')
const terminal = require('../lib/terminal-utils')

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

  let presets = options.presets
  if (presets) {
    presets = Array.isArray(presets) ? presets : [presets]
    options.presets = presets.map(preset => {
      if (typeof preset === 'string') {
        preset = loadPreset(preset)
      } else if (Array.isArray(preset)) {
        preset = loadPreset(preset[0], preset[1])
      }
      return preset
    })
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

  const app = vbuild(options)

  if (options.mode === 'production' || options.mode === 'test') {
    if (options.mode === 'production') {
      terminal.clear()
      console.log('> Creating an optimized production build:\n')
    }
    app.build()
      .then(stats => {
        printStats(stats)
        if (options.mode === 'test') {
          terminal.clear()
        } else if (options.mode === 'production') {
          if (options.generateStats) {
            const statsFile = cwd(options.cwd, typeof options.generateStats === 'string' ? options.generateStats : 'stats.json')
            console.log('> Generating webpack stats file')
            fs.writeFileSync(statsFile, JSON.stringify(stats.toJson()), 'utf8')
            console.log(chalk.dim(`> location: "${tildify(statsFile)}"`))
          }
        }
      })
      .catch(handleError)
  } else if (options.mode === 'watch') {
    app.watch()
    app.on('compile-done', printStats)
  } else if (options.mode === 'development') {
    const { server, host, port } = app.prepare()

    server.listen(port, host)
    .on('error', err => {
      if (err.code === 'EADDRINUSE') {
        return handleError(new AppError(`Port ${port} is already in use.\n\nYou can use another one by adding \`--port <port>\` or set it in config file.`))
      }
      handleError(err)
    })

    const url = `http://${host}:${port}`
    let copied

    app.once('compile-done', () => {
      if (options.open) {
        opn(url)
      }
    })

    app.on('compile-done', stats => {
      printStats(stats)
      console.log()
      if (stats.hasErrors()) {
        console.log(`${chalk.bgRed.black(' ERROR ')} Compiled with Errors!`)
      } else if (stats.hasWarnings()) {
        console.log(`${chalk.bgYellow.black(' WARN ')} Compiled with Warnings!`)
      } else {
        if (copied) {
          console.log(chalk.bold(`> Open ${url}`))
        } else {
          copied = true
          try {
            copy.writeSync(url)
            console.log(chalk.bold(`> Open ${url}`), '(copied!)')
          } catch (err) {
            console.log(chalk.bold(`> Open ${url}`))
          }
        }

        console.log(`\n${chalk.bgGreen.black(' DONE ')} Compiled successfully!`)
      }
      console.log()
    })
  }
})

module.exports.handleError = handleError

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

function printStats(stats) {
  terminal.clear()
  if (stats.hasErrors() || stats.hasWarnings()) {
    console.log(stats.toString('errors-only'))
    process.exitCode = 1
  } else {
    console.log(stats.toString({
      colors: true,
      chunks: false,
      modules: false,
      children: false
    }))
    process.exitCode = 0
  }
}

function loadPreset(name, options) {
  if (typeof name === 'string') {
    let preset
    try {
      preset = /^(\.|\/)/.test(name) ? name : `vbuild-preset-${name}`
      name = req(preset)
    } catch (err) {
      if (/missing path/.test(err.message)) {
        throw new AppError(`Cannot find module ${preset} in current working directory!`)
      } else {
        throw err
      }
    }
  }
  if (typeof name === 'function') {
    name = name(options)
  }
  return name
}
