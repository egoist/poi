module.exports = {
  plugins: [
    require('.')({
      files: 'example/*.test.js',
      chainWebpack() {
        console.log('extending webpack config')
      }
    })
  ]
}
