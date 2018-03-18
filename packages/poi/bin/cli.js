#!/usr/bin/env node

const importLocalFile = require('import-local-file')
const logger = require('@poi/logger')

const localFile = importLocalFile(__filename)
const forceGlobal = process.argv.includes('--force-global')
if (localFile && !forceGlobal) {
  logger.debug('Using local Poi', localFile)
  require(localFile)
} else {
  // Code for both global and local version
  require('./main') // eslint-disable-line import/no-unassigned-import
}
