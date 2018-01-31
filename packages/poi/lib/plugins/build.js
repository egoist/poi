module.exports = ctx => {
  const command = ctx.cli.registerCommand('build', 'Build app in production mode', () => {
    const compiler = ctx.createCompiler()
    compiler.run((err, stats) => {
      if (err) {
        console.error(err)
      }
    })
  })

  command.option('minimize', {
    desc: 'Minimize the output',
    alias: 'm'
  })
}
