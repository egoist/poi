const path = require('path')
const fs = require('fs')

exports.apply = api => {
  // TODO: refactor this
  // eslint-disable-next-line complexity
  api.chainWebpack((config, { type }) => {
    const { pages, entry } = api.config

    if (pages) {
      // Multi-page mode, set entries using `pages`
      for (const entryName of Object.keys(pages)) {
        const { entry } = pages[entryName]
        if (typeof entry === 'string') {
          config.entry(entryName).add(api.resolve(entry))
        } else if (Array.isArray(entry)) {
          config.entry(entryName).merge(entry.map(v => api.resolve(v)))
        } else {
          throw new TypeError('Entry value must be either string or array!')
        }
      }
    } else if (Array.isArray(entry) || typeof entry === 'string') {
      // Single-pages mode, add `entry` to `main` entry
      config.entry('index').merge([].concat(entry).map(v => api.resolve(v)))
    } else if (entry && typeof entry === 'object') {
      for (const entryName of Object.keys(entry)) {
        config
          .entry(entryName)
          .merge([].concat(entry[entryName]).map(v => api.resolve(v)))
      }
    }

    const defaultDevtool =
      api.mode === 'production' ? 'source-map' : 'cheap-module-eval-source-map'
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
      mode: api.mode === 'production' ? api.mode : 'development'
    })

    const filenames = require('../utils/get-filenames')({
      filenameHash: api.config.filenameHash,
      filenames: api.config.filenames,
      mode: api.mode
    })
    config.output
      .path(api.resolve(api.config.outDir))
      // Default values, will later be change by dev and build plugins
      .filename(filenames.js)
      .publicPath(api.config.publicPath)
      .chunkFilename(filenames.chunk)

    config.resolve.extensions
      .merge(['.js', '.ts', '.jsx', '.tsx', '.json'])
      .end()
      .alias.set('@', api.resolve('src'))

    if (api.command === 'dev' || api.command === 'watch') {
      config.plugin('timefix').use(require('time-fix-plugin'))
    }

    const baseDir = api.resolve()
    require('../webpack/rules/css')(config, api, filenames, type === 'server')
    require('../webpack/rules/vue')(config, { baseDir })
    require('../webpack/rules/js')(config, {
      baseDir,
      transpileModules: api.config.babel.transpileModules
    })
    require('../webpack/rules/graphql')(config)
    require('../webpack/rules/yaml')(config)
    require('../webpack/rules/toml')(config)
    require('../webpack/rules/fonts')(config, filenames.font)
    require('../webpack/rules/images')(config, filenames.image)

    if (
      api.options.progress !== false &&
      !api.options.debug &&
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
          showFileStats: false,
          mode: api.mode,
          devServer: api.config.devServer,
          clearConsole:
            api.options.clearConsole !== false && !api.options.debug,
          electron: api.config.target === 'electron',
          open: api.options.open
        }
      ])

    config.plugin('constants').use(require('webpack').DefinePlugin, [
      Object.assign(
        {
          __DEV__: JSON.stringify(api.mode !== 'production')
        },
        api.config.constants
      )
    ])

    const appEnvs = api.getEnvs()
    const envs = Object.keys(appEnvs).reduce((res, name) => {
      res[`process.env.${name}`] = JSON.stringify(appEnvs[name])
      return res
    }, {})
    config.plugin('envs').use(require('webpack').DefinePlugin, [envs])

    // Copy ./public/* to out dir
    // In non-dev commands since it uses devServerOptions.contentBase instead
    if (api.mode !== 'development' && fs.existsSync(api.resolve('public'))) {
      const CopyPlugin = require('copy-webpack-plugin')
      CopyPlugin.__expression = `require('copy-webpack-plugin')`

      api.chainWebpack(config => {
        config.plugin('copy-public').use(CopyPlugin, [
          [
            {
              from: api.resolve('public'),
              to: '.',
              ignore: ['.DS_Store']
            }
          ]
        ])
      })
    }

    // Disable webpack's default minimizer
    config.merge({
      optimization: {
        minimize: false
      }
    })

    // Add uglifyJS as a plugin
    const shouldMinimize =
      api.config.minimize === undefined
        ? api.mode === 'production'
        : Boolean(api.config.minimize)
    if (shouldMinimize) {
      config
        .plugin('uglifyjs')
        // eslint-disable-next-line import/no-extraneous-dependencies
        .use(require('uglifyjs-webpack-plugin'), [
          {
            cache: true,
            parallel: true,
            sourceMap: Boolean(api.config.sourceMap),
            uglifyOptions: {
              output: {
                comments: false
              },
              mangle: true
            }
          }
        ])
    }

    // Resolve loaders and modules in poi's node_modules folder
    const inWorkspaces = __dirname.includes('/poi/packages/poi/')
    const ownModules = inWorkspaces
      ? path.join(__dirname, '../../../../node_modules')
      : path.join(__dirname, '../../node_modules')
    config.resolve.modules
      .add(ownModules)
      .add(api.resolve('node_modules'))
      .add('node_modules')
    config.resolveLoader.modules
      .add(ownModules)
      .add(api.resolve('node_modules'))
      .add('node_modules')
  })
}

exports.name = 'builtin:config-base'
