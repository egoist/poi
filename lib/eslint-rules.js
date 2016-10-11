'use strict'
const detectInstalled = require('detect-installed')
const _ = require('./utils')

module.exports = function () {
  const localInstalled = detectInstalled('eslint-config-egoist-vue', true)
  const pathToEslintConfig = localInstalled ?
    _.cwd('node_modules/eslint-config-egoist-vue/index.js') :
    _.dir('node_modules/eslint-config-egoist-vue/index.js')
  return {
    configFile: pathToEslintConfig
  }
}
