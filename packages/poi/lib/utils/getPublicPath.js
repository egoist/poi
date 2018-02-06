function getPublicPath(command, homepage) {
  if (command === 'build' && typeof homepage === 'string') {
    return /\/$/.test(homepage) || homepage === '' ? homepage : homepage + '/'
  }
  return '/'
}

module.exports = getPublicPath
