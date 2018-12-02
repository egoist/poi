module.exports = ({ useHash, format }) => {
  let res

  if (format === 'iife') {
    res = {
      js: useHash ? 'assets/js/[name].[chunkhash:8].js' : 'assets/js/[name].js',
      css: useHash
        ? 'assets/css/[name].[chunkhash:8].css'
        : 'assets/css/[name].css',
      font: useHash
        ? 'assets/fonts/[path][name].[hash:8].[ext]'
        : 'assets/fonts/[path][name].[ext]',
      image: useHash
        ? 'assets/images/[path][name].[hash:8].[ext]'
        : 'assets/images/[path][name].[ext]'
    }
  } else {
    res = {
      js: '[name].js',
      css: '[name].css',
      font: '[path][name].[ext]',
      image: '[path][name].[ext]'
    }
  }

  return res
}
