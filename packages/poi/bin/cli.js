#!/usr/bin/env node
const importLocal = require('import-local')

if (importLocal(__filename)) {
  console.log('> Using local installed version of Poi')
} else {
  // Code for both global and local version
  require('./main') // eslint-disable-line import/no-unassigned-import
}
