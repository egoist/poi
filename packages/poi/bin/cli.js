#!/usr/bin/env node
const importLocalFile = require('import-local-file')

const localFile = importLocalFile(__filename)
if (localFile) {
  console.log('> Using local installed version of Poi')
  require(localFile)
} else {
  // Code for both global and local version
  require('./main') // eslint-disable-line import/no-unassigned-import
}
