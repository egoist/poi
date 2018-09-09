#!/usr/bin/env node
const cac = require('cac')

const cli = cac()

cli.command('*', 'Create a new project', (input, flags) => {
  return require('../lib')(
    Object.assign(
      {
        outDir: input[0] || '.'
      },
      flags
    )
  )
})

cli.parse()
