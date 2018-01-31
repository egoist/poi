const url = require('url')
const Server = require('webpack-dev-server')
const opn = require('opn')
const chalk = require('chalk')
const launchEditorMiddlewarre = require('launch-editor-middleware')
const getPort = require('get-port')
const address = require('address')
const launchEditorEndpoint = require('poi-dev-utils/launch-editor-endpoint')
const { unspecifiedAddress } = require('../utils')
const logger = require('../logger')
const { isPath } = require('../utils')

module.exports = ctx => {
  const command = ctx.cli.registerCommand(
    'develop',
    {
      desc: 'Run app in development mode',
      match(name) {
        return !name || isPath(name)
      }
    },
    async () => {
      const compiler = ctx.createCompiler()

      const devServerOptions = Object.assign(
        {
          hot: ctx.options.hotReload !== false,
          quiet: true,
          historyApiFallback: true,
          overlay: true,
          noInfo: true,
          disableHostCheck: true,
          publicPath: compiler.options.output.publicPath
        },
        compiler.options.devServer,
        ctx.options.devServer
      )

      const existingBefore = devServerOptions.before
      devServerOptions.before = app => {
        app.use(
          launchEditorEndpoint,
          launchEditorMiddlewarre(() =>
            console.log(
              `To specify an editor, sepcify the EDITOR env variable or ` +
                `add "editor" field to your Vue project config.\n`
            )
          )
        )
        existingBefore && existingBefore(app)
      }

      if (typeof devServerOptions.proxy === 'string') {
        devServerOptions.proxy = {
          '/api': {
            target: devServerOptions.proxy,
            changeOrigin: true,
            pathRewrite: {
              '^/api': ''
            }
          }
        }
      }
      const host = ctx.options.devServer.host
      const port = await getPort({ port: ctx.options.devServer.port, host })
      if (port !== ctx.options.devServer.port) {
        logger.warn(`Port ${ctx.options.devServer.port} has been used, switched to ${port}.`)
      }

      const server = new Server(compiler, devServerOptions)
      server.listen(port, host)
      let lanIP
      ctx.on('show-develop-logs', () => {
        let msg = `\n  ${chalk.green('App running at:')}`
        const isUnspecifiedAddress = unspecifiedAddress(host)

        const localURL = url.format({
          protocol: 'http',
          hostname: isUnspecifiedAddress ? 'localhost' : host,
          port
        })
        msg += `\n${chalk.bold(`  - Local:           ${localURL}`)}`
        if (isUnspecifiedAddress) {
          const lanURL = url.format({
            protocol: 'http',
            hostname: lanIP || (lanIP = address.ip()),
            port
          })
          msg += `\n${chalk.dim(`  - On Your Network: ${lanURL}`)}`
        }

        logger.log(msg + '\n')

        if (ctx.options.open) {
          opn(
            url.format({
              protocol: 'http',
              hostname: unspecifiedAddress(host) ? 'localhost' : host,
              port
            })
          )
        }
      })
    }
  )

  command.option('host', {
    desc: 'Server host'
  }).option('port', {
    desc: 'Server port'
  })
}
