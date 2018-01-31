module.exports = () => {
  return {
    name: 'build',
    extend(poi) {
      const command = poi.cli.registerCommand(
        'build',
        'Build app in production mode',
        () => {
          const compiler = poi.createCompiler()
          compiler.run((err, stats) => {
            if (err) {
              console.error(err)
            }
          })
        }
      )

      command.option('minimize', {
        desc: 'Minimize the output',
        alias: 'm'
      })
    }
  }
}
