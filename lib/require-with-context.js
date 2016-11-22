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
  const paths = [_.dir('node_modules')]
  if (_.isYarn()) {
    paths.push(_.dir('../'))
  }
  const config = requireFromString(result.code, file, {
    appendPaths: paths
  })
  return config.default || config
})
