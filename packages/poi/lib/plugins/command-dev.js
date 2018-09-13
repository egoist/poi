const setSharedCLIOptions = require('./utils/shared-cli-options')

exports.name = 'builtin:command-dev'

exports.extend = api => {
  const command = api.registerCommand(
    'dev',
    'Run app in dev mode',
    async () => {
      const webpackConfig = api.resolveWebpackConfig()
      const compiler = require('webpack')(webpackConfig)

      const devServerOptions = Object.assign(
        {
          hot: true,
          quiet: true,
          historyApiFallback: true,
          overlay: true,
          disableHostCheck: true,
          publicPath: webpackConfig.output.publicPath,
          contentBase: api.resolve('public'),
          watchContentBase: true
        },
        api.config.devServer
      )

      const existingBefore = devServerOptions.before
      devServerOptions.before = server => {
        server.use(
          require('@poi/dev-utils/launchEditorEndpoint'),
          require('launch-editor-middleware')(() =>
            console.log(
              `To specify an editor, sepcify the EDITOR env variable or ` +
                `add "editor" field to your Vue project config.\n`
            )
          )
        )
        existingBefore && existingBefore(server)
      }

      const exitingAfter = devServerOptions.after
      devServerOptions.after = server => {
        exitingAfter && exitingAfter(server)
        api.hooks.invoke('configureDevServer', server)
      }

      const WebpackDevServer = require('webpack-dev-server')
      const server = new WebpackDevServer(compiler, devServerOptions)

      const { devServer } = api.config
      devServer.actualPort = await require('get-port')({
        host: devServer.host,
        port: devServer.port
      })
      server.listen(devServer.actualPort, devServer.host)
    }
  )

  setSharedCLIOptions(command)
  command.option('host', 'Server host (default: 0.0.0.0)')
  command.option('port', 'Server port (default: 4000)')
}

exports.commandModes = {
  dev: 'development'
}
