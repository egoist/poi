'use strict'
const _ = require('./utils')
const deepAssign = require('deep-assign')

module.exports = {
  configFile: _.dir('node_modules/eslint-config-xo-space/esnext.js'),
  rules: {
    semi: [2, 'never'],
    'operator-linebreak': [2, 'before']
  }
}
