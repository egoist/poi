'use strict'
const co = require('co')
const chalk = require('chalk')
const copy = require('graceful-copy')
const tildify = require('tildify')
const pathExists = require('path-exists')
const _ = require('./utils')

module.exports = co.wrap(function * (options) {
  if (!options.projectName) {
    console.error(chalk.red('\n  Please specific a projectName, eg: vbuild init my-project\n'))
    process.exit(1)  // eslint-disable xo/no-process-exit
  }

  const dest = _.cwd(options.projectName)
  const exists = yield pathExists(dest)
  const tildyDest = tildify(dest)
  if (exists && !options.force) {
    console.error('\n ', chalk.red(`${chalk.underline(tildyDest)} folder exists\n`))
    console.error(`  run \`vbuild ${process.argv.slice(2).join(' ')} --force\` to override it\n`)
    return
  }

  yield copy(_.dir('./template'), dest, {
    data: options
  })

  console.log(chalk.green(`\n  New project \`${options.projectName}\` was created successfully!`))
  console.log(chalk.bold('\n  To get started:\n'))
  console.log(`  cd ${tildyDest} && npm install`)
  console.log('  npm run dev\n')

  console.log(chalk.bold('  To build for production:\n'))
  console.log('  npm run build\n')
})
