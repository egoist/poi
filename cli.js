#!/usr/bin/env node
'use strict'
const cac = require('cac')
const chalk = require('chalk')
const update = require('update-notifier')
const main = require('./lib')
const pkg = require('./package')

update({pkg}).notify()

const cli = cac()

cli
  .option('dev, d', 'Run in dev mode')
  .option('port, p', 'Run in dev mode')
  .option('watch, w', 'Run in watch mode')
  .option('clean', 'Clean dist directory before bundling')
  .option('live, l', 'Live reloading while file changes')
  .option('devtool', 'Specific the devtool for webpack')
  .option('title, t', 'HTML title')
  .option('resolve', 'Resolve modules in your app folder')
  .option('alias', 'Add custom aliases to resolve modules')
  .option('umd', 'Build in UMD mode and specific a module name')
  .option('cjs', 'Build in CommonJS mode')
  .option('electron', 'Build in Electron mode')
  .option('compress', 'Compress bundled files')
  .option('notify', 'Use desktop notifier as bundle valid or invalid')
  .option('silent', 'Do not open browser in dev mode')
  .option('disable-html', 'Disable HTML output')
  .option('template', 'Custom path to HTML template')
  .option('css-modules', 'Use CSS modules in normal JS files')
  .option('config', 'Custom path to config file')
  .option('externals', 'Exclude external modules from bundled files')
  .option('target', 'Bundle target, eg: node')
  .command('*', 'Run vbuild', (input, flags) => {
    const options = Object.assign({
      entry: input[0]
    }, flags)
    return main(options).catch(e => {
      console.log(chalk.red(e.stack))
      if (!cli.dev && !cli.watch) {
        process.exit(1)
      }
    })
  })

cli.usage(`${chalk.yellow('vbuild')} [entry] [options]`)
cli.example('vbuild --dev --css-modules --template ./template.html')
cli.parse()
