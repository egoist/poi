#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// dirty hack to get out of `node_modules` dir
const pjDir = path.join(path.resolve('..', '..'))
const fPath = path.join(pjDir, 'bsconfig.json')

// default bsconfig.json content
const defaultConfig = {
  name: `${path.basename(pjDir)}`,
  sources: [
    {
      dir: 'src'
    }
  ],
  'bsc-flags': ['-bs-super-errors'],
  reason: {},
  refmt: 3,
  'package-specs': [
    {
      module: 'es6',
      'in-source': false
    }
  ],
  suffix: '.bs.js'
}

// write bsconfig.json if not exist
if (!fs.existsSync(fPath)) {
  fs.writeFile(fPath, JSON.stringify(defaultConfig, null, 2), err => {
    if (err) {
      console.log(err)
      process.exit(1)
    }
  })
}
