#!/usr/bin/env node
'use strict'
const cac = require('cac')
const chalk = require('chalk')
const update = require('update-notifier')
const main = require('./lib')
const pkg = require('./package')
const init = require('./lib/init')

update({pkg}).notify()

const cli = cac()

cli
  .option('dev, d', 'Run in dev mode')
  .option('watch, w', 'Run in watch mode')
  .option('port, p', 'Port for dev server')
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
  .option('gzip', 'Gzip bundled files')
  .option('eslint', 'Run eslint while bundling')
  .option('notify', 'Use desktop notifier as bundle valid or invalid')
  .option('open', 'Open browser in dev mode')
  .option('disable-html', 'Disable HTML output')
  .option('template', 'Custom path to HTML template')
  .option('css-modules', 'Use CSS modules in normal JS files')
  .option('config', 'Custom path to config file')
  .option('externals', 'Exclude external modules from bundled files')
  .option('target', 'Bundle target, eg: node')
  .option('merge-config', 'Merge your custom webpack config file')


cli.usage(`${chalk.yellow('vbuild')} [entry] [options]`)
cli.example('vbuild --dev --css-modules --template ./template.html')

cli.parse()

