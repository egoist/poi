module.exports = ctx => {
  const command = ctx.cli.registerCommand('watch', 'Run app in watch mode', () => {
    const compiler = ctx.createCompiler()
    compiler.watch({}, err => {
      if (err) {
        console.error(err)
      }
    })
  })
}
