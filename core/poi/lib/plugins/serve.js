exports.name = 'builtin:serve'

exports.cli = api => {
  const { command, args } = api

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

    const { https, host, port: _port, open } = devServer
    const port = await require('get-port')({ port: _port, host })

    const webpackConfig = api.createWebpackChain().toConfig()

    // No need to print URLs in test mode
    if (api.mode !== 'test') {
      webpackConfig.plugins.push({
        apply(compiler) {
          let isFirstBuild = true
          // TODO: figure out why using .tap() can't catch error
          compiler.hooks.done.tap('print-serve-urls', stats => {
            if (stats.hasErrors() || stats.hasWarnings()) return

            require('@poi/dev-utils/printServeMessage')({
              https,
              host,
              port,
              expectedPort: _port,
              open,
              isFirstBuild,
              publicUrl: api.config.output.publicUrl
            })

            isFirstBuild = false
          })
        }
      })
    }

    const compiler = api.createWebpackCompiler(webpackConfig)

    const devServerConfig = Object.assign(
      {
        noInfo: true,
        historyApiFallback: true,
        overlay: true,
        disableHostCheck: true,
        publicPath: webpackConfig.output.publicPath,
        contentBase:
          api.config.publicFolder && api.resolveCwd(api.config.publicFolder),
        watchContentBase: true,
        stats: 'none'
      },
      devServer,
      {
        proxy:
          typeof devServer.proxy === 'string'
            ? require('@poi/dev-utils/prepareProxy')(
                devServer.proxy,
                api.resolveCwd(api.config.publicFolder),
                api.cli.options.debug
              )
            : devServer.proxy
      }
    )

    const existingBefore = devServerConfig.before
    devServerConfig.before = server => {
      api.hooks.invoke('beforeDevMiddlewares', server)

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

    const exitingAfter = devServerConfig.after
    devServerConfig.after = server => {
      exitingAfter && exitingAfter(server)
      api.hooks.invoke('onCreateServer', server) // TODO: remove this in the future

      api.hooks.invoke('afterDevMiddlewares', server)
    }

    api.hooks.invoke('createDevServerConfig', devServerConfig)

    const WebpackDevServer = require('webpack-dev-server')
    const server = new WebpackDevServer(compiler, devServerConfig)

    api.hooks.invoke('createServer', { server, port, host })

    server.listen(port, host)
  })
}

exports.apply = api => {
  api.hook('createWebpackChain', config => {
    if (!api.cli.options.serve) return

    if (api.config.devServer.hot) {
      const hotEntries =
        api.config.devServer.hotEntries.length > 0
          ? api.config.devServer.hotEntries
          : config.entryPoints.store.keys()
      for (const entry of hotEntries) {
        if (config.entryPoints.has(entry)) {
          config.entry(entry).prepend('#webpack-hot-client')
        }
      }

      const { HotModuleReplacementPlugin } = require('webpack')
      HotModuleReplacementPlugin.__expression = `require('webpack').HotModuleReplacementPlugin`

      config.plugin('hot').use(HotModuleReplacementPlugin)
    }

    // Point sourcemap entries to original disk location (format as URL on Windows)
    // Useful for react-error-overlay
    config.output.devtoolModuleFilenameTemplate(info =>
      info.absoluteResourcePath.replace(/\\/g, '/')
    )

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
