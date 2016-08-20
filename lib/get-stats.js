'use strict'
const path = require('path')
const table = require('text-table')
const tildify = require('tildify')
const chalk = require('chalk')
const getMode = require('./get-mode')

function handleEntry(entry) {
  if (Array.isArray(entry)) {
    return entry.map((e, i) => {
      const append = entry.length > 1 ? `[${i}]` : ''
      return [
        chalk.green(`Entry${append}`),
        tildify(e)
      ]
    })
  } else if (typeof entry === 'object') {
    return Object.keys(entry).map(key => {
      return [
        chalk.green(`Entry[${key}]`),
        tildify(entry[key])
      ]
    })
  }
  return [
    [
      chalk.green('Entry'),
      tildify(entry)
    ]
  ]
}

module.exports = function (config, options) {
  const mode = getMode(options)

  let ret = [
    [
      chalk.green('Mode'),
      mode
    ]
  ]

  ret = ret.concat(handleEntry(config.entry))

  ret.push([
    chalk.green('Output'),
    tildify(path.join(config.output.path, config.output.filename))
  ])

  if (options.config) {
    ret.push([
      chalk.green('Config'),
      tildify(options.config)
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
