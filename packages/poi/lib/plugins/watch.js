module.exports = poi => {
  poi.cli.handleCommand('watch', 'Run app in watch mode', () => {
    const compiler = poi.createCompiler()
    compiler.watch({}, err => {
      if (err) {
        console.error(err)
      }
    })
  })
}
