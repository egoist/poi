/* eslint-disable unicorn/no-process-exit */
const chalk = require('chalk')
const notifier = require('node-notifier')
const co = require('co')
const stripAnsi = require('strip-ansi')
const tildify = require('tildify')
const merge = require('lodash.merge')
const findBabelConfig = require('babel-load-config')
const findPostcssConfig = require('postcss-load-config')
const copy = require('clipboardy')
const AppError = require('../lib/app-error')
const { ownDir } = require('../lib/utils')
const loadConfig = require('../lib/load-config')
const vbuild = require('../lib')
const terminal = require('../lib/terminal-utils')

const loadPostCSSConfig = co.wrap(function * () {
  let defaultPostcssOptions = {}
  try {
    defaultPostcssOptions = yield findPostcssConfig({}, null, { argv: false })
      .then(res => {
        console.log(chalk.bold('> Using extenal postcss configuration'))
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
    console.log(chalk.bold(`> Using external babel configuration`))
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
    defaultBabelOptions.presets = [require.resolve('babel-preset-vue-app')]
  }

  return defaultBabelOptions
}

module.exports = co.wrap(function * (cliOptions) {
  console.log(chalk.bold(`> Running in ${cliOptions.mode} mode`))

  const defaultBabelOptions = loadBabelConfig()
  const [defaultPostcssOptions, config] = yield Promise.all([
    loadPostCSSConfig(),
    loadConfig(cliOptions)
  ])

  const options = merge({
    babel: defaultBabelOptions,
    postcss: defaultPostcssOptions
  }, config, cliOptions)

  const app = vbuild(options)

  if (options.mode === 'production' || options.mode === 'test') {
    app.build()
      .then(printStats)
      .then(() => {
        if (options.mode === 'test') {
          terminal.clear()
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
        return handleError(new AppError(`Port ${port} is already in use.\n\nYou can use another one by adding \`--devServer.port <port>\` or set it in config file.`))
      }
      handleError(err)
    })

    let copied

    app.on('compile-done', stats => {
      printStats(stats)
      console.log()
      if (stats.hasErrors()) {
        console.log(`${chalk.bgRed.black(' ERROR ')} Compiled with Errors!`)
      } else if (stats.hasWarnings()) {
        console.log(`${chalk.bgYellow.black(' WARN ')} Compiled with Warnings!`)
      } else {
        const url = `http://${host}:${port}`
        if (copied) {
          console.log(chalk.bold(`> Open ${url}`))
        } else {
          copied = true
          copy.writeSync(url)
          console.log(chalk.bold(`> Open ${url}`), '(copied!)')
        }

        console.log(`\n${chalk.bgGreen.black(' DONE ')} Compiled successfully!`)
      }
      console.log()
    })
  }
})

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
