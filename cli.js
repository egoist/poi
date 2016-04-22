#!/usr/bin/env node
'use strict'
const meow = require('meow')
const chalk = require('chalk')
const update = require('update-notifier')
const main = require('./lib')

const cli = meow(`
  Usage:
    vbuild [options]

  Example:
    vbuild --entry index.js --port 4000 --dev --browser-sync

  Options:
    -e/--entry:                 Specific entries
    -d/--dev:                   Development mode
    -w/--watch:                 Watch mode
    -p/--port [port]:           Server port, port is optional
    -t/--title [title]:         App title, title is optional
    -b/--browsers:              Set autoprefixer browser list
    --lint:                     Lint your code
    --umd <moduleName>:         UMD mode and prvide a module name
    --cjs:                      CommonJS mode
    --electron:                 Electron mode
    --silent:                   Do not open browser
    --browser-sync [port]:      Browser Sync, port is optional
    --disable-html:             Do not generate html file
    --output-assets-path:       Output assets path using assets-webpack-plugin
    -c/--config [path]:         Use config file or specific a config file path
    -v/--version:               Print version
    -h/--help:                  Print help (You are here!)
`, {
  alias: {
    e: 'entry',
    d: 'dev',
    p: 'port',
    c: 'config',
    v: 'version',
    h: 'help',
    t: 'title',
    b: 'browsers',
    w: 'watch'
  }
})

update({pkg: cli.pkg}).notify()

const options = cli.flags
main(options).catch(e => console.log(chalk.red(e.stack)))
