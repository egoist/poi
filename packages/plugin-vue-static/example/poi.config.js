const path = require('path')

module.exports = {
  entry: path.join(__dirname, 'index.js'),
  plugins: [
    require('..')()
  ]
}
