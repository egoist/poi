'use strict'
const path = require('path')

const _ = module.exports = {}

_.cwd = function () {
  const arr = [].slice.call(arguments || [])
  return path.join.apply(null, [process.cwd()].concat(arr))
}

_.dir = function () {
  const arr = [].slice.call(arguments || [])
  return path.join.apply(null, [__dirname, '../'].concat(arr))
}

_.pkg = function () {
  try {
    return require(_.cwd('package.json'))
  } catch (err) {
    return {}
  }
}
