'use strict'
const _ = require('./utils')

module.exports = {
  configFile: _.dir('node_modules/eslint-config-xo-space/esnext.js'),
  rules: {
    'semi': [2, 'never'],
    'operator-linebreak': [2, 'before'],
    'no-new': 0
  }
}
