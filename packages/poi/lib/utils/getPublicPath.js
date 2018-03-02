function getPublicPath(command, publicPath) {
  if (command === 'build' && typeof publicPath === 'string') {
    return /\/$/.test(publicPath) || publicPath === ''
      ? publicPath
      : publicPath + '/'
  }
  return '/'
}

module.exports = getPublicPath
