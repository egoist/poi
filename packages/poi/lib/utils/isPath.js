function isPath(v) {
  return /.+\..+/.test(v) || v.indexOf('/') > -1
}

module.exports = isPath
