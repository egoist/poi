module.exports = {
  plugins: [
    require('.')({
      files: 'example/*.test.js',
      extendWebpack() {
        console.log('extending webpack config')
      }
    })
  ]
}
