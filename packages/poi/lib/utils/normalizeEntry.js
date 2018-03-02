const path = require('path')

module.exports = entry => {
  const res = {}

  if (typeof entry === 'string') {
    res.main = [path.resolve(entry)]
  } else if (Array.isArray(entry)) {
    res.main = entry.map(e => path.resolve(e))
  } else if (typeof entry === 'object') {
    Object.keys(entry).forEach(k => {
      const v = entry[k]
      if (Array.isArray(v)) {
        res[k] = v.map(e => path.resolve(e))
      } else {
        res[k] = [path.resolve(v)]
      }
    })
  }

  return res
}
