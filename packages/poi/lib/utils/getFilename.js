function getFilename(useHash, customFileName) {
  return Object.assign(
    {
      js: useHash ? '[name].[chunkhash:8].js' : '[name].js',
      css: useHash ? '[name].[contenthash:8].css' : '[name].css',
      image: 'assets/images/[name].[hash:8].[ext]',
      font: useHash
        ? 'assets/fonts/[name].[hash:8].[ext]'
        : 'assets/fonts/[name].[ext]',
      chunk: useHash ? '[name].[chunkhash:8].js' : '[name].js'
    },
    customFileName
  )
}

module.exports = getFilename
