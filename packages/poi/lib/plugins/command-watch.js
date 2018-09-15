exports.name = 'builtin:command-watch'

exports.extend = api => {
  api.registerCommand(
    'watch',
    'Run app in watch mode (Like dev command but without a server)',
    () => {
      const compiler = api.resolveWebpackCompiler()
      compiler.watch({}, () => {
        // Do nothing...
      })
    }
  )

  if (api.options.command === 'watch') {
    api.chainWebpack(config => {
      config.plugin('report-status').tap(([options]) => [
        Object.assign({}, options, {
          showFileStats: true
        })
      ])
    })
  }
}

exports.commandModes = {
  watch: 'development'
}
