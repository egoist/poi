'use strict'
const path = require('path')
const pathExists = require('path-exists')
const detectInstalled = require('detect-installed')

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

// if installed in .yarn-config/global/node_modules/vbuild
_.yarnGlobally = function () {
  return __dirname.indexOf('.yarn-config/global') !== -1
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
  return _.yarnGlobally() || (_.hasLockFile() && _.installedLocally ())
}
