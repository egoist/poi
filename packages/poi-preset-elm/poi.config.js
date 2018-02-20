module.exports = {
  entry: 'example/index.js',
  presets: [
    require('./index.js')({
      loaderOptions: {
        cwd: __dirname + '/example',
      },
    })
  ]
}
