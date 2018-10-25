exports.name = 'builtin:command-watch'

exports.apply = api => {
  api.setCommandMode('watch', 'development')

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
