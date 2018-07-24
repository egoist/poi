function getPublicPath(command, publicPath) {
  if (['build', 'watch'].includes(command) && typeof publicPath === 'string') {
    return /\/$/.test(publicPath) || publicPath === ''
      ? publicPath
      : publicPath + '/'
  }
  return '/'
}

module.exports = getPublicPath
