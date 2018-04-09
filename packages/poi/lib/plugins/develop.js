const url = require('url')
const opn = require('opn')
const chalk = require('chalk')
const launchEditorMiddlewarre = require('launch-editor-middleware')
const getPort = require('get-port')
const address = require('address')
const launchEditorEndpoint = require('@poi/dev-utils/launchEditorEndpoint')
const createDevServer = require('@poi/core/createDevServer')
const logger = require('@poi/logger')
const unspecifiedAddress = require('../utils/unspecifiedAddress')
const isPath = require('../utils/isPath')
const sharedCLIOptions = require('../utils/sharedCLIOptions')

module.exports = poi => {
  const command = poi.cli.handleCommand(
    'develop',
    {
      desc: 'Run app in development mode',
      match(name) {
        return !name || isPath(name)
      }
    },
    async () => {
      const compiler = poi.createCompiler()

      const devServerOptions = Object.assign(
        {
          hot: poi.options.hotReload !== false,
          quiet: true,
          historyApiFallback: true,
          overlay: true,
          disableHostCheck: true,
          publicPath: compiler.options.output.publicPath
        },
        compiler.options.devServer,
        poi.options.devServer
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
        poi.hooks.invoke('configureDevServer', app)
        existingBefore && existingBefore(app)
      }

      const host = poi.options.devServer.host
      const port = await getPort({ port: poi.options.devServer.port, host })
      if (port !== poi.options.devServer.port) {
        logger.warn(
          `Port ${
            poi.options.devServer.port
          } has been used, switched to ${port}.`
        )
      }

      const server = createDevServer(compiler, devServerOptions)
      server.listen(port, host)
      let lanIP
      poi.on('show-develop-logs', () => {
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

        if (poi.options.open) {
          opn(
            url.format({
              protocol: 'http',
              hostname: unspecifiedAddress(host) ? 'localhost' : host,
              port
            })
          )
        }
      })

      return {
        devServer: server
      }
    }
  )

  sharedCLIOptions(command)

  command
    .option('host', {
      desc: 'Server host'
    })
    .option('port', {
      desc: 'Server port'
    })
}
