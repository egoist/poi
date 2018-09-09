module.exports = ({ filenames, filenameHash, command }) => {
  const useHash =
    typeof filenameHash === 'boolean' ? filenameHash : command === 'build'
  return Object.assign(
    {
      js: useHash ? 'assets/js/[name].[chunkhash:8].js' : 'assets/js/[name].js',
      css: useHash
        ? 'assets/css/[name].[contenthash:8].css'
        : 'assets/css/[name].css',
      font: useHash
        ? 'assets/fonts/[path][name].[hash:8].[ext]'
        : 'assets/fonts/[path][name].[ext]',
      image: useHash
        ? 'assets/images/[path][name].[hash:8].[ext]'
        : 'assets/images/[path][name].[ext]',
      chunk: useHash
        ? 'assets/js/[name].[chunkhash:8].js'
        : 'assets/js/[name].js'
    },
    filenames
  )
}
