'use strict'
const path = require('path')
const table = require('text-table')
const tildify = require('tildify')
const chalk = require('chalk')
const getMode = require('./get-mode')

function handleEntry(entry) {
  const entries = entry.client.concat(entry.vendor.join(', '))
  return entries.map((e, i) => {
    const append = entries.length > 1 ? `[${i}]` : ''
    return [
      chalk.green(`> Entry${append}`),
      tildify(e)
    ]
  })
}

module.exports = function (config, options) {
  const mode = getMode(options)

  let ret = [
    [
      chalk.green('> Mode'),
      mode
    ]
  ]

  ret = ret.concat(handleEntry(config.entry))

  ret.push([
    chalk.green('> Output'),
    tildify(path.join(config.output.path, config.output.filename))
  ])

  if (options.config) {
    ret.push([
      chalk.green('> Config'),
      tildify(options.config)
    ])
  }

  if (options.dev) {
    ret.push([
      chalk.green('> Port'),
      options.port
    ])
  }

  if (config.devtool) {
    ret.push([
      chalk.green('> Devtool'),
      config.devtool
    ])
  }

  return table(ret)
}
