'use strict'
const path = require('path')
const table = require('text-table')
const tildify = require('tildify')
const chalk = require('chalk')
const getMode = require('./get-mode')

module.exports = function (config, options) {
  const mode = getMode(options)
  const keys = ['entry', 'output']
  const ret = keys.map(key => {
    if (key === 'entry') {
      return [
        chalk.green('Entry'),
        config[key]
      ]
    } else if (key === 'output') {
      return [
        chalk.green('Output'),
        tildify(path.join(config[key].path, config[key].filename))
      ]
    }
  })
  ret.unshift([
    chalk.green('Mode'),
    mode
  ])
  if (options.config) {
    ret.push([
      chalk.green('Config'),
      options.config
    ])
  }
  if (options.dev) {
    ret.push([
      chalk.green('Port'),
      options.port
    ])
  }
  if (config.devtool) {
    ret.push([
      chalk.green('Devtool'),
      config.devtool
    ])
  }
  return table(ret)
}
