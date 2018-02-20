const path = require('path')

module.exports = {
  entry: 'example/index.js',
  presets: [
    require('./index.js')({
      loaderOptions: {
        cwd: path.join(__dirname, '/example')
      }
    })
  ]
}
