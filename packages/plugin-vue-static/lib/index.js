const path = require('path')
const ClientPlugin = require('vue-server-renderer/client-plugin')
const ServerPlugin = require('vue-server-renderer/server-plugin')

const clientEntry = path.join(__dirname, '../app', 'client-entry.js')

const serverEntry = path.join(__dirname, '../app', 'server-entry.js')

module.exports = ({ routes = ['/'] } = {}) => {
  return poi => {
    const projectEntry = poi.options.entry.main[0]
    poi.options.entry.main = [
      path.join(
        __dirname,
        '../app',
        poi.command === 'develop' ? 'client-entry.js' : 'prod-entry.js'
      )
    ]

    if (poi.command === 'build') {
      // Disable HTML generation in `poi build`
      // Since we use `app/index.template.html` with Vue SSR instead
      poi.options.html = false
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
          const config = poi.webpackConfig
          config.plugins.delete('friendly-reporter')

          // Create client config
          config
            .entry('main')
            .clear()
            .add(clientEntry)
          config.plugin('ssr').use(ClientPlugin)
          config.output.path(path.resolve('.vue-static/client'))
          config
            .plugin('webpackbar')
            .tap(([options]) => [
              Object.assign({}, options, { name: 'client' })
            ])
          const clientConfig = config.toConfig()

          // Create server config
          config
            .entry('main')
            .clear()
            .add(serverEntry)
          config.plugin('ssr').use(ServerPlugin)
          config
            .plugin('webpackbar')
            .tap(([options]) => [
              Object.assign({}, options, { name: 'server' })
            ])
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
          const serverConfig = config.toConfig()

          await poi.runCompiler([clientConfig, serverConfig])

          await require('./generate')(routes, poi.options.outDir)
        }
      }
      return command
    })
  }
}
