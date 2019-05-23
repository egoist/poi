const path = require('path')
const os = require('os')
const chalk = require('chalk')
const fs = require('fs-extra')

const isLocalPath = v => /^[./]|(^[a-zA-Z]:)/.test(v)

const normalizeEntry = v => {
  if (v.startsWith('module:')) {
    return v.replace(/^module:/, '')
  }
  if (isLocalPath(v)) {
    return v
  }
  return `./${v}`
}

module.exports = (config, api) => {
  /** Set entry */

  const webpackEntry = {}
  const { entry, pages } = api.config
  if (pages) {
    for (const entryName of Object.keys(pages)) {
      const value = pages[entryName]
      webpackEntry[entryName] = [].concat(
        typeof value === 'string' ? value : value.entry
      )
    }
    api.logger.debug('Using `pages` option thus `entry` is ignored')
  } else if (typeof entry === 'string') {
    webpackEntry.index = [entry]
  } else if (Array.isArray(entry)) {
    webpackEntry.index = entry
  } else if (typeof entry === 'object') {
    Object.assign(webpackEntry, entry)
  }

  for (const name of Object.keys(webpackEntry)) {
    webpackEntry[name] = Array.isArray(webpackEntry[name])
      ? webpackEntry[name].map(v => normalizeEntry(v))
      : normalizeEntry(webpackEntry[name])
  }

  config.merge({ entry: webpackEntry })

  /** Set extensions */
  config.resolve.extensions.merge([
    '.wasm',
    '.mjs',
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.json'
  ])

  /** Support react-native-web by default, cuz why not? */
  // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
  config.resolve.alias
    .set('react-native', 'react-native-web')
    .set('#webpack-hot-client$', require.resolve('@poi/dev-utils/hotDevClient'))

  // output.sourceMap defaults to false in production mode
  config.devtool(
    api.config.output.sourceMap === false
      ? false
      : api.mode === 'production'
      ? 'source-map'
      : api.mode === 'test'
      ? 'cheap-module-eval-source-map'
      : 'cheap-module-source-map'
  )

  /** Alias @ to `src` folder since many apps store app code here */
  config.resolve.alias.set('@', api.resolveCwd('src'))

  /** Set mode */
  config.mode(api.mode === 'production' ? 'production' : 'development')

  config.merge({
    // Disable webpack's default minimizer
    // Minimization will be handled by mode:production plugin
    optimization: {
      minimize: false
    },
    // Disable default performance hints
    // TODO: maybe add our custom one
    performance: {
      hints: false
    }
  })

  /** Set output */
  config.output.path(api.resolveOutDir())
  config.output.filename(api.config.output.fileNames.js)
  config.output.chunkFilename(
    api.config.output.fileNames.js.replace(/\.js$/, '.chunk.js')
  )
  config.output.publicPath(api.config.output.publicUrl)

  /** Set format */
  const { format, moduleName } = api.config.output
  if (format === 'cjs') {
    config.output.libraryTarget('commonjs2')
  } else if (format === 'umd') {
    if (!moduleName) {
      api.logger.error(
        `"moduleName" is missing for ${chalk.bold('umd')} format`
      )
      api.logger.tip(
        `To add it, simply use flag ${chalk.cyan('--module-name <name>')}`
      )
      api.logger.tip(
        `Like ${chalk.cyan(
          '--module-name React'
        )} if you're building the React.js source code`
      )
      throw new api.PoiError({
        message: 'missing moduleName for umd format',
        dismiss: true
      })
    }
    config.output.libraryTarget('umd')
    config.output.library(moduleName)
  }

  // Set output target
  const { target } = api.config.output
  config.target(target === 'electron' ? 'electron-renderer' : target)

  const inYarnWorkspaces = __dirname.includes('/poi/core/poi')
  const poiDependenciesDir = inYarnWorkspaces
    ? path.join(__dirname, '../../../../node_modules')
    : path.join(__dirname, '../../../')

  /** Resolve loaders */
  config.resolveLoader.modules.add('node_modules').add(poiDependenciesDir)

  /** Resolve modules */
  config.resolve.modules.add('node_modules').add(poiDependenciesDir)

  // Add progress bar
  if (
    api.cli.options.progress !== false &&
    process.stdout.isTTY &&
    !process.env.CI
  ) {
    const homeRe = new RegExp(os.homedir(), 'g')
    config.plugin('progress').use(require('webpack').ProgressPlugin, [
      /**
       * @param {Number} per
       * @param {string} message
       * @param {string[]} args
       */
      (per, message, ...args) => {
        const spinner = require('../utils/spinner')

        const msg = `${(per * 100).toFixed(2)}% ${message} ${args
          .map(arg => {
            const message = arg.replace(homeRe, '~')
            return message.length > 40
              ? `...${message.substr(message.length - 39)}`
              : message
          })
          .join(' ')}`

        if (per === 0) {
          spinner.start(msg)
        } else if (per === 1) {
          spinner.stop()
        } else {
          spinner.start(msg)
        }
      }
    ])
  }

  /** Add a default status reporter */
  config.plugin('print-status').use(require('./PrintStatusPlugin'), [
    {
      printFileStats: api.mode !== 'test',
      printSucessMessage: api.mode !== 'test',
      clearConsole: api.cli.options.clearConsole
    }
  ])

  /** Add constants plugin */
  config
    .plugin('constants')
    .use(require('webpack').DefinePlugin, [api.webpackUtils.constants])

  /** Inject envs */
  const { envs } = api.webpackUtils
  config.plugin('envs').use(require('webpack').DefinePlugin, [
    Object.keys(envs).reduce((res, name) => {
      res[`process.env.${name}`] = JSON.stringify(envs[name])
      return res
    }, {})
  ])

  /** Miniize JS files */
  if (api.config.output.minimize) {
    config.plugin('minimize').use(require('terser-webpack-plugin'), [
      {
        cache: true,
        parallel: true,
        sourceMap: api.config.output.sourceMap,
        terserOptions: {
          parse: {
            // we want terser to parse ecma 8 code. However, we don't want it
            // to apply any minfication steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 8
          },
          compress: {
            ecma: 5,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            // https://github.com/facebook/create-react-app/issues/5250
            // Pending futher investigation:
            // https://github.com/terser-js/terser/issues/120
            inline: 2
          },
          mangle: {
            safari10: true
          },
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true
          }
        }
      }
    ])
  }

  if (!api.isProd) {
    config
      .plugin('case-sensitive-paths')
      .use(require('case-sensitive-paths-webpack-plugin'))

    const nodeModulesDir =
      api.configLoader.resolve('node_modules') || api.resolveCwd('node_modules')
    config
      .plugin('watch-missing-node-modules')
      .use(require('@poi/dev-utils/WatchMissingNodeModulesPlugin'), [
        nodeModulesDir
      ])
  }

  config.plugin('copy-public-folder').use(require('copy-webpack-plugin'), [
    [
      {
        from: {
          glob: '**/*',
          dot: true
        },
        context: api.resolveCwd(api.config.publicFolder),
        to: '.',
        ignore: ['.DS_Store']
      }
    ]
  ])

  if (api.config.output.clean !== false) {
    config.plugin('clean-out-dir').use(
      class CleanOutDir {
        apply(compiler) {
          compiler.hooks.beforeRun.tapPromise('clean-out-dir', async () => {
            if (api.resolveOutDir() === process.cwd()) {
              api.logger.error(`Refused to clean current working directory`)
              return
            }
            await fs.remove(api.resolveOutDir())
          })
        }
      }
    )
  }
}
