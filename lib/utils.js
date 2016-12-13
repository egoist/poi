'use strict'
const path = require('path')
const pathExists = require('path-exists')
const chalk = require('chalk')
const detectInstalled = require('detect-installed')
const yarnGlobally = require('installed-by-yarn-globally')

const _ = module.exports = {}

_.cwd = function () {
  const arr = [].slice.call(arguments || [])
  return path.resolve.apply(null, [process.cwd()].concat(arr))
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

// cwd/yarn.lock exists
_.hasLockFile = function () {
  return pathExists.sync(_.cwd('yarn.lock'))
}

// if installed in cwd/node_modules/vbuild
_.installedLocally = function () {
  return detectInstalled('vbuild', true)
}

_.isYarn = function () {
  return yarnGlobally(__dirname) || (_.hasLockFile() && _.installedLocally())
}

_.isType = function (obj, type) {
  return Object.prototype.toString.call(obj) === `[object ${type}]`
}

