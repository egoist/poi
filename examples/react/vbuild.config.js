module.exports = {
  entry: 'src/index.js',
  webpack(config) {
    config.entry.client.unshift('react-hot-loader/patch')
    return config
  }
}
