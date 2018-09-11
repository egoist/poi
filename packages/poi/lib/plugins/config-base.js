const path = require('path')
const fs = require('fs')

exports.extend = api => {
  api.chainWebpack(config => {
    const { pages } = api.config

    for (const entryName of Object.keys(pages)) {
      const { entry } = pages[entryName]
      if (typeof entry === 'string') {
        config.entry(entryName).add(api.resolveBaseDir(entry))
      } else if (Array.isArray(entry)) {
        config.entry(entryName).merge(entry.map(v => api.resolveBaseDir(v)))
      } else {
        throw new TypeError('Entry value must be either string or array!')
      }
    }

    const defaultDevtool =
      api.options.command === 'build'
        ? 'source-map'
        : 'cheap-module-eval-source-map'
    const devtool =
      typeof api.config.sourceMap === 'string'
        ? api.config.sourceMap
        : api.config.sourceMap
          ? defaultDevtool
          : false
    config.devtool(devtool)

    config.merge({
      performance: {
        hints: false
      },
      mode: api.options.command === 'build' ? 'production' : 'development'
    })

    config.output
      .path(api.resolveBaseDir(api.config.outDir))
      // Default values, will later be change by dev and build plugins
      .filename(api.config.filenames.js)
      .publicPath(api.config.publicPath)
      .chunkFilename(api.config.filenames.chunk)

    config.resolve.alias.set('@', api.resolveBaseDir('src'))

    const baseDir = api.resolveBaseDir()
    require('../webpack/rules/css')(config, api)
    require('../webpack/rules/vue')(config, { baseDir })
    require('../webpack/rules/babel')(config, { baseDir })
    require('../webpack/rules/graphql')(config)
    require('../webpack/rules/yaml')(config)
    require('../webpack/rules/toml')(config)
    require('../webpack/rules/fonts')(config, api.config.filenames.font)
    require('../webpack/rules/images')(config, api.config.filenames.image)

    // Images

    if (
      api.cliOptions.progress !== false &&
      !api.cliOptions.debug &&
      process.stdout.isTTY
    ) {
      const { ProgressPlugin } = require('webpack')
      ProgressPlugin.__expression = `require('webpack').ProgressPlugin`
      config.plugin('progress').use(ProgressPlugin)
    }

    config
      .plugin('report-status')
      .use(require('../webpack/plugins/report-status-plugin'), [
        {
          showFileStats: api.options.command === 'build',
          command: api.options.command,
          devServer: api.config.devServer
        }
      ])

    config.plugin('constants').use(require('webpack').DefinePlugin, [
      Object.assign(
        {
          POI_PUBLIC_PATH: JSON.stringify(api.config.publicPath),
          POI_COMMAND: JSON.stringify(api.command),
          __DEV__: JSON.stringify(api.command !== 'build')
        },
        api.config.constants
      )
    ])

    // Copy ./public/* to out dir
    // In non-dev commands since it uses devServerOptions.contentBase instead
    if (
      api.options.command !== 'dev' &&
      fs.existsSync(api.resolveBaseDir('public'))
    ) {
      const CopyPlugin = require('copy-webpack-plugin')
      CopyPlugin.__expression = `require('copy-webpack-plugin')`

      api.chainWebpack(config => {
        config.plugin('copy-public').use(CopyPlugin, [
          [
            {
              from: api.resolveBaseDir('public'),
              to: '.',
              ignore: ['.DS_Store']
            }
          ]
        ])
      })
    }

    // Resolve loaders and modules in poi's node_modules folder
    const inWorkspaces = __dirname.includes('/poi/packages/poi/')
    const ownModules = inWorkspaces
      ? path.join(__dirname, '../../../../node_modules')
      : path.join(__dirname, '../../node_modules')
    config.resolve.modules.add(ownModules).add(api.resolveBaseDir('node_modules')).add('node_modules')
    config.resolveLoader.modules.add(ownModules).add(api.resolveBaseDir('node_modules')).add('node_modules')
  })
}

exports.name = 'builtin:config-base'
