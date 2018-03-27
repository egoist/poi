const PoiError = require('./PoiError')
const { cwd } = require('./dir')

let projectPkgCache

function readProjectPkg() {
  try {
    projectPkgCache = projectPkgCache || require(cwd('package.json'))
    return projectPkgCache
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return {}
    }
    throw new PoiError(err.message)
  }
}

module.exports = readProjectPkg
