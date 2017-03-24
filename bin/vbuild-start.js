/* eslint-disable unicorn/no-process-exit */
const chalk = require('chalk')
const chokidar = require('chokidar')
const notifier = require('node-notifier')
const co = require('co')
const stripAnsi = require('strip-ansi')
const tildify = require('tildify')
const merge = require('lodash.merge')
const findBabelConfig = require('babel-load-config')
const findPostcssConfig = require('postcss-load-config')
const AppError = require('../lib/app-error')
const { getConfigFile, ownDir } = require('../lib/utils')
const loadConfig = require('../lib/load-config')
const main = require('../lib')

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

const applyEnv = function (env = {}) {
  for (const key in env) {
    if (typeof process.env[key] === 'undefined') {
      process.env[key] = env[key]
    }
  }
}

module.exports = function (cliOptions) {
  const start = co.wrap(function * () {
    const defaultBabelOptions = loadBabelConfig()
    const defaultPostcssOptions = yield loadPostCSSConfig()
    const config = yield loadConfig(cliOptions)

    const options = merge({
      babel: defaultBabelOptions,
      postcss: defaultPostcssOptions,
      env: { NODE_ENV: cliOptions.dev ? 'development' : 'production' }
    }, config, cliOptions)

    applyEnv(options.env)

    const result = main(options)

    const { host, port, open } = result.options
    const { server, devMiddleWare } = result

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

          console.log(`> Detected changes from ${chalk.yellow(filename)}, restarting...\n`)
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
