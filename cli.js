#!/usr/bin/env node
'use strict'
const meow = require('meow')
const chalk = require('chalk')
const main = require('./lib')

const cli = meow(`
  Usage:
    vbuild [entries] [options]

  Example:
    vbuild --port 4000 --dev --browser-sync

  Options:
    -d/--dev:                   Development mode
    -p/--port [port]:           Server port, port is optional
    -t/--title [title]:         App title, title is optional
    --electron:                 Electron mode
    --silent:                   Do not open browser
    --browser-sync [port]:      Browser Sync, port is optional
    -c/--config:                Specific a config file path
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
    t: 'title'
  }
})

const options = cli.flags
main(options).catch(e => console.log(chalk.red(e.stack)))
