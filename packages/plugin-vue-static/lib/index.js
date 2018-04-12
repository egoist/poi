const path = require('path')
const ClientPlugin = require('vue-server-renderer/client-plugin')
const ServerPlugin = require('vue-server-renderer/server-plugin')
const chalk = require('chalk')

const clientEntry = path.join(__dirname, '../app', 'client-entry.js')

const serverEntry = path.join(__dirname, '../app', 'server-entry.js')

const updateFriendlyReporter = config => {
  if (config.plugins.has('friendly-reporter')) {
    config.plugin('friendly-reporter').tap(([options]) => [
      Object.assign({}, options, {
        showFileStats: false,
        showCompiledIn: false,
        clearConsole: false
      })
    ])
  }
}

const setEnvs = (config, envs) => {
  config.plugin('define').tap(([options]) => [Object.assign({}, options, envs)])
}

module.exports = ({ routes = ['/'] } = {}) => {
  return poi => {
    const projectEntry = poi.options.entry.main[0]

    if (poi.command === 'build') {
      // Disable HTML generation in `poi build`
      // Since we use `app/index.template.html` with Vue SSR instead
      poi.options.html = false
    } else if (poi.command === 'develop') {
      // Always use client-entry in development mode
      poi.options.entry.main = [clientEntry]
    }

    poi.chainWebpack(config => {
      config.resolve.alias.set('@project-entry$', projectEntry)
      // prettier-ignore
      // Transpile app dir
      config.module.rule('js')
        .include
          .add(path.join(__dirname, '../app'))
    })

    poi.cli.cac.commands = poi.cli.cac.commands.filter(command => {
      if (command.command.name === 'build') {
        command.handler = async () => {
          // Create client config
          const clientConfig = poi.createWebpackConfig({
            context: { type: 'client' },
            chainWebpack(config) {
              config
                .entry('main')
                .clear()
                .add(clientEntry)
              config.plugin('ssr').use(ClientPlugin)
              config.output.path(path.resolve('.vue-static/client'))
              if (config.plugins.has('webpackbar')) {
                config.plugin('webpackbar').tap(([options]) => [
                  Object.assign({}, options, {
                    name: 'client',
                    color: 'magentaBright'
                  })
                ])
              }
              updateFriendlyReporter(config)
              setEnvs(config, {
                'process.browser': 'true',
                'process.server': 'false'
              })
            }
          })

          // Create server config
          const serverConfig = poi.createWebpackConfig({
            context: { type: 'server' },
            chainWebpack(config) {
              config
                .entry('main')
                .clear()
                .add(serverEntry)
              config.plugin('ssr').use(ServerPlugin)
              if (config.plugins.has('webpackbar')) {
                config.plugin('webpackbar').tap(([options]) => [
                  Object.assign({}, options, {
                    name: 'server',
                    color: 'cyanBright'
                  })
                ])
              }
              updateFriendlyReporter(config)
              setEnvs(config, {
                'process.server': 'true',
                'process.browser': 'false'
              })
              config.merge({
                target: 'node',
                output: {
                  path: path.resolve('.vue-static/server'),
                  libraryTarget: 'commonjs2'
                },
                externals: [
                  require('webpack-node-externals')({
                    whitelist: [/\.(?!(?:jsx?|json)$).{1,5}$/i]
                  })
                ],
                optimization: {
                  splitChunks: false
                }
              })
            }
          })

          const start = Date.now()
          const stats = await poi.runCompiler([clientConfig, serverConfig])
          if (!stats.hasErrors()) {
            await require('./generate')(routes, poi.options.outDir)
            const end = Date.now()

            poi.logger.success(
              `Successfully generated into ${chalk.green(
                path.relative(process.cwd(), poi.options.outDir)
              )} folder in ${end - start}ms.`
            )
          }
        }
      }
      return command
    })
  }
}
