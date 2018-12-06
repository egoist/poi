const chalk = require('chalk')
const logger = require('@poi/logger')

exports.name = 'builtin:serve'

exports.apply = api => {
  api.hook('onCreateCLI', ({ command, args }) => {
    command.option('-s, --serve', 'Serve assets on a local server')

    if (!args.has('s') && !args.has('serve')) return

    command
      .option('-p, --port <port>', 'Server port', { default: '4000' })
      .option('--host <host>', 'Server host', { default: '0.0.0.0' })
      .option('--proxy <url>', 'Proxy API requests')
      .option('--no-hot', 'Disable hot reloading')
      .option('-o, --open', 'Open in browser')

    command.action(async () => {
      const devServer = Object.assign({}, api.config.devServer)
      delete devServer.hotEntries

      const { host, port: _port, open } = devServer
      const port = await require('get-port')({ port: _port })

      const webpackConfig = api.createWebpackConfig().toConfig()

      webpackConfig.plugins.push({
        apply(compiler) {
          // TODO: figure out why using .tap() can't catch error
          compiler.hooks.done.tap('print-serve-urls', stats => {
            if (stats.hasErrors() || stats.hasWarnings()) return

            const ip = require('address').ip()

            const isUnspecifiedHost = host === '0.0.0.0' || host === '::'
            const prettyHost = isUnspecifiedHost ? 'localhost' : host

            logger.log()
            logger.log(
              `Local:             http://${prettyHost}:${chalk.bold(port)}`
            )
            logger.log(`On Your Network:   http://${ip}:${chalk.bold(port)}`)
            logger.log()

            if (open) {
              require('@poi/dev-utils/openBrowser')(
                `http://${prettyHost}:${port}`
              )
            }
          })
        }
      })

      const compiler = api.createWebpackCompiler(webpackConfig)

      const devServerOptions = Object.assign(
        {
          quiet: true,
          historyApiFallback: true,
          overlay: true,
          disableHostCheck: true,
          publicPath: webpackConfig.output.publicPath,
          contentBase: api.resolveCwd('public'),
          watchContentBase: true,
          stats: {
            colors: true
          }
        },
        devServer
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
        server.use(require('@poi/dev-utils/skipServiceWorker')())
        existingBefore && existingBefore(server)
      }

      const exitingAfter = devServerOptions.after
      devServerOptions.after = server => {
        exitingAfter && exitingAfter(server)
        api.hooks.invoke('onCreateServer', server)
      }

      const WebpackDevServer = require('webpack-dev-server')
      const server = new WebpackDevServer(compiler, devServerOptions)

      server.listen(port, host)
    })
  })

  api.hook('onCreateWebpackConfig', config => {
    if (!api.cli.options.serve) return

    config.devtool('cheap-module-eval-source-map')

    const { hotEntries = ['index'] } = api.config.devServer || {}
    const { hot } = api.config.devServer

    if (hot) {
      for (const entry of hotEntries) {
        if (config.entryPoints.has(entry)) {
          config
            .entry(entry)
            .prepend(require.resolve('@poi/dev-utils/hotDevClient'))
        }
      }

      const { HotModuleReplacementPlugin } = require('webpack')
      HotModuleReplacementPlugin.__expression = `require('webpack').HotModuleReplacementPlugin`

      config.plugin('hot').use(HotModuleReplacementPlugin)
    }

    // Don't show bundled files in --serve
    if (config.plugins.has('print-status')) {
      config.plugin('print-status').tap(([options]) => [
        Object.assign(options, {
          printFileStats: false
        })
      ])
    }

    // Don't copy public folder, since we serve it instead
    config.plugins.delete('copy-public-folder')
  })
}
