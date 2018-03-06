#!/usr/bin/env node --trace-deprecation

const importLocalFile = require('import-local-file')
const logger = require('@poi/logger')

const localFile = importLocalFile(__filename)
if (localFile) {
  logger.debug('Using local installed version of Poi')
  require(localFile)
} else {
  // Code for both global and local version
  require('./main') // eslint-disable-line import/no-unassigned-import
}
