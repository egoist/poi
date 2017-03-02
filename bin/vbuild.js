#!/usr/bin/env node
const chalk = require('chalk')
const yargs = require('yargs')
const update = require('update-notifier')
const pkg = require('../package.json')

update({ pkg }).notify()

const argv = yargs
  .usage(`\n${chalk.yellow('vbuild')} [command] [options]`)
  .option('dev', {
    description: 'Run in development mode',
    alias: 'd'
  })
  .option('watch', {
    description: 'Run in watch mode',
    alias: 'w'
  })
  .option('config', {
    description: 'Load config file',
    alias: 'c'
  })
  .option('dist', {
    description: 'The folder to write files'
  })
  .option('eslint', {
    description: 'Run ESLint to check code during bundling.'
  })
  .option('template-compiler', {
    description: 'Include the Vue template compiler'
  })
  .option('json', {
    description: 'Generate webpack stats in a json file'
  })
  .option('port', {
    description: 'Port for dev server'
  })
  .option('open', {
    description: 'Open browser',
    alias: 'o'
  })
  .version(pkg.version)
  .alias('version', 'v')
  .alias('help', 'h')
  .epilogue('for more information, find our manual at https://github.com/egoist/vbuild')
  .help()
  .argv

const entry = argv._[0]
delete argv._

const options = Object.assign({
  entry
}, argv)

for (const key in options) {
  if (options[key] === undefined) {
    delete options[key]
  }
}

require('./vbuild-start')(options)
