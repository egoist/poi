const path = require('path')
const os = require('os')
const chalk = require('chalk')

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
  let { entry } = api.config
  if (typeof entry === 'string') {
    entry = {
      index: [entry]
    }
  } else if (Array.isArray(entry)) {
    entry = {
      index: entry
    }
  } else {
    entry = Object.assign({}, entry)
  }

  for (const name of Object.keys(entry)) {
    entry[name] = entry[name].map(v => normalizeEntry(v))
  }

  config.merge({ entry })

  /** Set extensions */
  config.resolve.extensions.merge(['.js', '.json', '.jsx', '.ts', '.tsx'])

  /** Support react-native-web by default, cuz why not? */
  // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
  config.resolve.alias.set('react-native', 'react-native-web')

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

  const poiInstalledDir = path.join(__dirname, '../../../')

  /** Resolve loaders */
  config.resolveLoader.modules.add('node_modules').add(poiInstalledDir)

  /** Resolve modules */
  config.resolve.modules.add('node_modules').add(poiInstalledDir)

  // Add progress bar
  if (
    api.cli.options.progress !== false &&
    process.stdout.isTTY &&
    !process.env.CI &&
    api.mode !== 'test'
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
            return arg.replace(homeRe, '~')
          })
          .join(' ')}`

        if (per === 0) {
          spinner.start(msg)
        } else if (per === 1) {
          spinner.stop()
        } else {
          spinner.text = msg
        }
      }
    ])
  }

  /** Add a default status reporter */
  if (api.mode !== 'test') {
    config.plugin('print-status').use(require('./PrintStatusPlugin'), [
      {
        printFileStats: true,
        clearConsole: api.cli.options.clearConsole
      }
    ])
  }

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
        context: api.resolveCwd('public'),
        to: '.'
      }
    ]
  ])
}
