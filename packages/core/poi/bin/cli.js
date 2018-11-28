#!/usr/bin/env node
const Poi = require('..')

const poi = new Poi()

poi.run().catch(error => {
  poi.spinner.stop()
  if (error.poi) {
    if (!error.dismiss) {
      poi.logger.error(error.message)
    }
  } else {
    console.error(error.stack)
  }
  process.exit(1)
})
