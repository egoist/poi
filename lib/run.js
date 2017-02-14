const path = require('path')
const chalk = require('chalk')
const rm = require('rimraf').sync
const webpack = require('webpack')
const createServer = require('../lib/server')
const logger = require('./logger')

module.exports = function (webpackConfig, options) {
  process.stdout.write('\x1Bc')

  if (options.inspect) {
    console.log(webpackConfig)
  }

  if (typeof options.run === 'function') {
    return options.run(webpackConfig)
  }

  let compiler
  try {
    compiler = webpack(webpackConfig)
  } catch (err) {
    if (err.name === 'WebpackOptionsValidationError') {
      logger.fatal(err.message)
    } else {
      throw err
    }
  }

  if (options.watch) {
    console.log('> Running in watch mode')
    rm(path.join(options.dist, '*'))
    compiler.watch({}, (err, stats) => handleBuild(err, stats, true))
  } else if (options.dev) {
    const server = createServer(compiler, options)

    server.listen(options.port, options.host)
    if (options.open) {
      require('opn')(`http://${options.host}:${options.port}`)
    }
  } else {
    console.log('> Creating an optimized production build:\n')
    // remove dist files but keep that folder in production mode
    rm(path.join(options.dist, '*'))
    compiler.run(handleBuild)
  }

  function handleBuild(err, stats, watch) {
    if (err) {
      logger.fatal(err.stack)
    }
    if (stats.hasErrors() || stats.hasWarnings()) {
      logger.fatal(stats.toString('errors-only'))
    }
    console.log(stats.toString(options.stats))
    console.log(`\n${chalk.bgGreen.black(' DONE ')} Compiled successfully!\n`)
    if (!watch) {
      if (options.lib) {
        console.log(`The ${chalk.cyan(options.dist)} folder is ready to be published.`)
        console.log(`Make sure you have correctly set ${chalk.cyan('package.json')}\n`)
      } else {
        console.log(`The ${chalk.cyan(options.dist)} folder is ready to be deployed.`)
        console.log(`You may also serve it locally with a static server:\n`)
        console.log(`  ${chalk.yellow('npm')} i -g serve`)
        console.log(`  ${chalk.yellow('serve')} ${options.dist}\n`)
      }
    }
  }
}
