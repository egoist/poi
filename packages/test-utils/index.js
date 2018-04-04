const Poi = require('poi')
const MemoryFS = require('memory-fs')

const _ = (module.exports = {})

_.bundle = options => {
  const mfs = new MemoryFS()
  return new Poi('build', Object.assign({ outputFileSystem: mfs }, options))
}
