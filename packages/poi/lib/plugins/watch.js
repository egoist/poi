module.exports = {
  name: 'builtin:watch',
  apply(poi) {
    poi.cli.handleCommand('watch', 'Run app in watch mode', () => {
      const compiler = poi.createCompiler()
      const watcher = compiler.watch({}, err => {
        if (err) {
          console.error(err)
        }
      })
      return {
        webpackWatcher: watcher
      }
    })
  }
}
