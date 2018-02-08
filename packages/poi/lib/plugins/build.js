module.exports = poi => {
  const command = poi.cli.handleCommand(
    'build',
    'Build app in production mode',
    () => poi.runCompiler()
  )

  command.option('minimize', {
    desc: 'Minimize the output',
    alias: 'm'
  })
}
