const util = require('util')
const puppeteer = require('puppeteer-core')
const express = require('express')
const chalk = require('chalk')
const { consoleMessageToLogArgs, filterLogs } = require('./utils')

module.exports = async ({ outDir, compiler, options, logger, runCompiler }) => {
  let page // eslint-disable-line  prefer-const

  compiler.hooks.done.tap('reload-browser', stats => {
    if (stats.hasErrors()) return

    if (options.framework) {
      console.log(chalk.bold(`Running tests with ${options.framework}`))
    }

    if (page) {
      page.reload()
    }
  })

  const stats = await runCompiler(compiler, options.watch)

  // Return if something went wrong during bundling
  if (stats && stats.hasErrors()) {
    return
  }

  // Launch browser and create a new page
  const browser = await puppeteer.launch({
    headless: options.headless,
    executablePath: require('chrome-location')
  })
  page = await browser.newPage()

  // Serve output files
  const server = express()
  server.use('/', express.static(outDir))

  const HOST = '0.0.0.0'
  const PORT = 58395
  server.listen(PORT, HOST)

  const exit = async (code, force) => {
    if (code === 0) {
      logger.done('All tests have passed!')
    }

    // Don't exit in watch mode
    if (options.watch && !force) return

    await browser.close()

    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(code)
  }

  const MAGIC_LOG = '$$$_PUPPET_MAGIC_LOG_$$$'

  const handleMagicLog = (type, ...args) => {
    if (type === 'exit') {
      exit(args[0])
    }
  }

  page.on('console', async message => {
    const type = message.type()

    const consoleArgs = filterLogs(type, await consoleMessageToLogArgs(message))
    const text = util.format(...consoleArgs)

    // Ignore magic messages, since they are control messages
    if (text.startsWith(MAGIC_LOG)) {
      return handleMagicLog(...consoleArgs.slice(1))
    }

    if (type === 'clear') {
      return console.clear()
    }
    if (type === 'startGroupCollapsed') {
      return console.groupCollapsed()
    }
    if (type === 'endGroup') {
      return console.groupEnd()
    }

    if (!text) return

    if (type === 'error') {
      console.error(text)
    } else if (type === 'warning') {
      console.warn(text)
    } else if (type === 'debug') {
      console.debug(text)
    } else if (type === 'startGroup') {
      console.group(text)
    } else if (type === 'info') {
      console.log(text)
    } else {
      console.log(text)
    }
  })

  await page.evaluateOnNewDocument(`
  window.puppet = {
    exit(code = 0) {
      console.log('${MAGIC_LOG}', 'exit', code)
    },
    watch: ${options.watch},
    ui: ${JSON.stringify(options.ui)}
  }
  `)

  await page.goto(`http://${HOST}:${PORT}`)
}
