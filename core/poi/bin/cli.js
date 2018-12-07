#!/usr/bin/env node
// eslint-disable-next-line import/no-unassigned-import
require('v8-compile-cache')
const Poi = require('..')

async function main() {
  try {
    const poi = new Poi()
    await poi.run()
  } catch (error) {
    require('../lib/utils/spinner').stop()
    if (error.poi) {
      if (!error.dismiss) {
        require('@poi/logger').error(error.message)
      }
    } else {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

main()
