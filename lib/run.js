const fs = require('fs')
const path = require('path')
const http = require('http')
const chalk = require('chalk')
const rm = require('rimraf').sync
const webpack = require('webpack')
const createServer = require('../lib/server')
const AppError = require('./app-error')

module.exports = function (webpackConfig, options) {
  console.log(chalk.dim('---------------------'))
  process.stdout.write('\x1Bc')
  if (options.dev) {
    console.log(chalk.cyan('> Starting development server'))
  }

  const cleanDist = () => {
    if (options.cleanDist && !options.format) {
      rm(path.join(options.dist, '*'))
    }
  }

  if (options.inspect) {
    console.log(webpackConfig)
  }

  const result = {
    webpackConfig,
    options
  }

  if (typeof options.run === 'function') {
    options.run(webpackConfig)
    return result
  }

  let compiler
  try {
    compiler = webpack(webpackConfig)
  } catch (err) {
    if (err.name === 'WebpackOptionsValidationError') {
      throw new AppError(err.message)
    } else {
      throw err
    }
  }
  result.compiler = compiler

  if (options.watch) {
    // watch mode
    console.log('> Running in watch mode')
    cleanDist()

    result.watcher = compiler.watch({}, (err, stats) => handleBuild(err, stats, true))
  } else if (options.dev) {
    // dev mode
    const { app, devMiddleWare } = createServer(compiler, options)

    result.server = http.createServer(app)
    result.app = app
    result.devMiddleWare = devMiddleWare
  } else {
    // default production mode
    console.log('> Creating an optimized production build:\n')
    // remove dist files but keep that folder in production mode
    cleanDist()
    compiler.run(handleBuild)
  }

  return result

  function handleBuild(err, stats, watch) {
    if (err) {
      throw new AppError(err.stack)
    }
    if (stats.hasErrors()) {
      const failureMessage = `\n\n${chalk.bgRed.black(' ERROR ')} Compiled with errors!\n`
      console.error(stats.toString('errors-only').trim() + failureMessage)
      process.exitCode = 1
      return
    }

    if (stats.hasWarnings()) {
      const failureMessage = `\n\n${chalk.bgRed.black(' WARN ')} Compiled with warnings!\n`
      console.error(stats.toString('errors-only').trim() + failureMessage)
      process.exitCode = 0
      return
    }

    console.log(stats.toString(options.stats))
    console.log(`\n${chalk.bgGreen.black(' DONE ')} Compiled successfully!\n`)
    process.exitCode = 0

    if (!watch) {
      // generate stats.json
      if (options.json) {
        const json = JSON.stringify(stats.toJson())
        fs.writeFileSync(typeof options.json === 'string' ? options.json : './stats.json', json, 'utf8')
        console.log('Webpack stats has been written to ./stats.json\n')
      }

      if (options.format) {
        console.log(`The ${chalk.cyan(options.dist)} folder is ready to be published.`)
        console.log(`Make sure you have correctly configured ${chalk.cyan('package.json')}\n`)
      } else {
        console.log(`The ${chalk.cyan(options.dist)} folder is ready to be deployed.`)
        console.log(`You may also serve it locally with a static server:\n`)
        console.log(`  ${chalk.yellow('yarn')} global add serve`)
        console.log(`  ${chalk.yellow('serve')} ${options.dist} -s\n`)
      }
    }
  }
}
