#!/usr/bin/env node
'use strict'
const yargs = require('yargs')
const chalk = require('chalk')
const update = require('update-notifier')
const main = require('./lib')
const pkg = require('./package')

const cli = yargs
  .describe('dev', 'Run in dev mode')
    .alias('dev', 'd')
    .boolean('dev')
  .describe('port', 'Port of dev server')
    .alias('port', 'p')
  .describe('watch', 'Run in watch mode')
    .alias('watch', 'w')
    .boolean('watch')
  .describe('live', 'Live reloading while file changes')
    .alias('live', 'l')
    .boolean('live')
  .describe('devtool', 'Specific the devtool for webpack')
    .string('devtool')
  .describe('title', 'HTML title')
    .alias('title', 't')
    .string('title')
  .describe('browsers', 'Set autoprefixer browser list')
    .alias('browsers', 'b')
    .array('browsers')
  .describe('alias', 'User preset webpack alias')
  .describe('umd', 'Build in UMD mode and specific a module name')
    .string('umd')
  .describe('cjs', 'Build in CommonJS mode')
    .boolean('cjs')
  .describe('electron', 'Build in Electron mode')
    .boolean('electron')
  .describe('silent', 'Do not open browser in dev mode')
    .boolean('silent')
  .describe('browser-sync', 'User browser-sync and specific a port')
  .describe('disable-html', 'Disable HTML output')
  .describe('output-assets-path', 'Custom name of output webpack-asset.json')
    .alias('output-assets-path', 'osp')
  .describe('template', 'Custom path to HTML template')
  .describe('css-modules', 'Use CSS modules in normal JS files')
  .describe('config', 'Custom path to config file')
    .alias('config', 'c')
  .describe('no-config', 'Disable looking for default config file')
    .alias('no-config', 'nc')
  .describe('version', 'Output version number')
    .alias('version', 'v')
  .help('h')
    .alias('h', 'help')
  .argv

if (cli.version) {
  console.log(pkg.version)
  process.exit(0)
}

update({pkg}).notify()

const input = cli._
delete cli._
cli.entry = input.length === 0 ? ['./src/index.js'] : input
main(cli).catch(e => {
  console.log(chalk.red(e.stack))
  if (!cli.dev && !cli.watch) {
    process.exit(1)
  }
})
