'use strict'
const fs = require('fs-promise')
const co = require('co')
const babel = require('babel-core')
const requireFromString = require('require-from-string')
const _ = require('./utils')

require('source-map-support').install({
  hookRequire: true,
  environment: 'node'
})

module.exports = co.wrap(function * (file, babelOptions) {
  const content = yield fs.readFile(file, 'utf8')
  const result = babel.transform(content, Object.assign({}, babelOptions, {
    presets: [require.resolve('babel-preset-es2015'), require.resolve('babel-preset-stage-2')],
    filename: file,
    sourceMaps: 'inline'
  }))
  const config = requireFromString(result.code, file, {
    prependPaths: [
      _.dir('node_modules')
    ]
  })
  return config.default || config
})
