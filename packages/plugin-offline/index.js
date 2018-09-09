const OfflinePlugin = require('offline-plugin')

OfflinePlugin.__expression = `require('offline-plugin')`

exports.extend = (api, options) => {
  const pluginOptions = Object.assign(
    {
      externals: [],
      appShell: '/index.html',
      excludes: ['**/.*', '**/*.map', '**/*.gz', '**/*.gzip', '**/*.br'],
      ServiceWorker: {
        output: 'service-worker.js',
        events: true
      }
    },
    options
  )

  api.chainWebpack(config => {
    if (api.options.command !== 'build') return

    config.plugin('offline').use(OfflinePlugin, [pluginOptions])
  })

  if (api.isCommand('dev')) {
    api.configureDevSever(server => {
      server.use(
        require('skip-service-worker')(pluginOptions.ServiceWorker.output)
      )
    })
  }
}

exports.name = 'offline'
