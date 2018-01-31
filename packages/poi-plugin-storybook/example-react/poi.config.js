module.exports = {
  entry: ['example-react/index.js', 'example-react/addons.js'],

  plugins: [require('poi-plugin-react')(), require('..')()]
}
