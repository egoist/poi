#!/usr/bin/env node --no-deprecation
// --no-deprecation flag is useds to suppress webpack 4 deprecation warnings
// we should remove it in RC version
// blockers:
//  - html-webpack-plugin

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
