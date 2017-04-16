#!/usr/bin/env node
const chalk = require('chalk')
const yargs = require('yargs')
const update = require('update-notifier')
const pkg = require('../package.json')

update({ pkg }).notify()

function getOpts(argv, mode) {
  const opts = Object.keys(argv).reduce((curr, next) => {
    if (typeof argv[next] !== 'undefined' && next !== 'mode') {
      curr[next] = argv[next]
    }
    return curr
  }, {})
  const cmd = argv._[0]
  let entry
  if (['bundle', 'dev', 'watch', 'test'].indexOf(cmd) > -1) {
    entry = argv._[1]
  } else {
    entry = argv[0]
  }
  if (entry) {
    opts.entry = entry
  }
  return Object.assign({ mode }, opts)
}

function createHandler(mode) {
  return argv => require('./run')(getOpts(argv, mode))
}

yargs // eslint-disable-line no-unused-expressions
  .usage(`\n${chalk.yellow('vbuild')} [command] [options]`)
  .command('*', 'Build App in Production mode', () => {}, createHandler('production'))
  .command('dev', 'Run App in development mode', () => {}, createHandler('development'))
  .command('watch', 'Run App in watch mode', () => {}, createHandler('watch'))
  .command('test', 'Compile test files', () => {}, createHandler('test'))
  .version(pkg.version)
  .alias('version', 'v')
  .alias('help', 'h')
  // v6 docs is moved to vbuild6.surge.sh
  .epilogue('for more information, find our manual at https://vbuild.js.org')
  .help()
  .argv
