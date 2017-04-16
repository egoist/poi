module.exports = {
  entry: 'src/index.js',
  extendWebpack(config) {
    config.entry('client').prepend('react-hot-loader/patch')
  }
}
