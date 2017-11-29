module.exports = {
  entry: [
    'example-react/index.js',
    'example-react/addons.js'
  ],

  presets: [
    require('..')()
  ]
}
