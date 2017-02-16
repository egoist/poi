const fs = require('fs')
const chalk = require('chalk')
const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const PostCompilePlugin = require('post-compile-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const isYarn = require('installed-by-yarn-globally')
const webpackMerge = require('webpack-merge')
const {cwd, ownDir, getConfigFile} = require('./utils')
const run = require('./run')
const loaders = require('./loaders')
const loadConfig = require('./load-config')
const logger = require('./logger')

function start(cliOptions) { // eslint-disable-line complexity
  const userConfig = loadConfig(cliOptions)

  let options = Object.assign({
    entry: 'index.js',
    dist: 'dist',
    html: {},
    babel: {
      cacheDirectory: true,
      sourceMaps: cliOptions.dev ? false : 'both',
      presets: [require.resolve('babel-preset-vue-app')]
    },
    stats: {
      chunks: false,
      children: false,
      modules: false,
      colors: true
    }
  }, userConfig, cliOptions)

  let postcssOptions = options.postcss
  const defaultPostcssPlugins = [
    require('autoprefixer')(Object.assign({
      browsers: ['ie > 8', 'last 4 versions']
    }, options.autoprefixer))
  ]
  if (!Object.prototype.hasOwnProperty.call(options, 'postcss')) {
    // when `postcss` is not set in config file (it can be undefined though)
    // use default plugins
    postcssOptions = defaultPostcssPlugins
  } else if (options.autoprefixer !== false) {
    // `postcss` is set and `autoprefixer` is not disabled
    // then we add `autoprefixer` to it
    // only consider this when it's `Array` or `Object`
    if (Array.isArray(postcssOptions)) {
      postcssOptions = defaultPostcssPlugins.concat(postcssOptions)
    } else if (typeof postcssOptions === 'object') {
      postcssOptions.plugins = postcssOptions.plugins || []
      postcssOptions.plugins = defaultPostcssPlugins.concat(postcssOptions.plugins)
    }
  }

  if (options.entry === 'index.js' && !fs.existsSync(options.entry)) {
    logger.fatal(`Entry file ${chalk.yellow(options.entry)} does not exist, did you forget to create one?`)
  }

  if (options.dev) {
    options = Object.assign({
      host: 'localhost',
      port: 4000,
      hot: true,
      hmrEntry: ['client']
    }, options)
  } else {
    options = Object.assign({
      vendor: true
    }, options)
  }

  const filename = getFilenames(options)

  const cssOptions = {
    extract: !options.dev,
    sourceMap: true,
    cssModules: options.cssModules
  }

  let webpackConfig = {
    entry: {client: []},
    output: {
      path: cwd(options.dist),
      publicPath: '/',
      filename: filename.js
    },
    performance: {
      hints: false
    },
    resolve: {
      extensions: ['.js', '.vue', '.css'],
      modules: [
        cwd(),
        cwd('node_modules'),
        ownDir('node_modules')
      ]
    },
    resolveLoader: {
      modules: [
        cwd('node_modules'),
        ownDir('node_modules')
      ]
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: [/node_modules/]
        },
        {
          test: /\.es6$/,
          loader: 'babel-loader'
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.(ico|jpg|png|gif|eot|otf|webp|ttf|woff|woff2)(\?.*)?$/,
          loader: 'file-loader',
          query: {
            name: filename.static
          }
        },
        {
          test: /\.(svg)(\?.*)?$/,
          loader: 'file-loader',
          query: {
            name: filename.static
          }
        }
      ].concat(loaders.styleLoaders(cssOptions))
    },
    plugins: [
      new PostCompilePlugin(stats => {
        process.stdout.write('\x1Bc')

        if (options.dev && !options.watch) {
          if (stats.hasErrors() || stats.hasWarnings()) {
            console.log(stats.toString('errors-only'))
            console.log()
            console.log(chalk.bgRed.black(' ERROR '), 'Compiling failed!')
          } else {
            console.log(stats.toString(options.stats))
            if (webpackConfig.target === 'electron-renderer') {
              console.log(chalk.bold(`\n> Open Electron in another tab\n`))
            } else {
              console.log(chalk.bold(`\n> Open http://localhost:${options.port}\n`))
            }
            console.log(chalk.bgGreen.black(' DONE '), 'Compiled successfully!')
          }
          console.log()
        }
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(options.dev ? 'development' : 'production')
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: !options.dev,
        options: {
          context: cwd(),
          babel: options.babel,
          postcss: postcssOptions,
          vue: {
            postcss: postcssOptions,
            loaders: loaders.cssLoaders(cssOptions),
            cssModules: {
              localIndentName: '[name]__[local]___[hash:base64:5]'
            }
          }
        }
      })
    ]
  }

  if (typeof options.entry === 'string') {
    webpackConfig.entry.client.push(options.entry)
  } else if (Array.isArray(options.entry)) {
    webpackConfig.entry.client = options.entry
  } else if (typeof options.entry === 'object') {
    webpackConfig.entry = options.entry
  }

  if (options.html) {
    if (Array.isArray(options.html)) {
      webpackConfig.plugins = webpackConfig.plugins.concat(options.html.map(html => new HtmlPlugin(Object.assign({
        title: 'VBuild',
        template: ownDir('lib/template.html')
      }, html))))
    } else {
      webpackConfig.plugins.push(new HtmlPlugin(Object.assign({
        title: 'VBuild',
        template: ownDir('lib/template.html')
      }, options.html)))
    }
  }

  if (options.eslint) {
    webpackConfig.module.rules.push({
      test: /\.(vue|js)$/,
      loader: 'eslint-loader',
      enforce: 'pre',
      exclude: [/node_modules/],
      options: Object.assign({
        configFile: require.resolve('eslint-config-vue-app'),
        useEslintrc: false,
        fix: true
      }, options.eslintConfig)
    })
  }

  // copy ./static/** to dist folder
  if (fs.existsSync('static')) {
    webpackConfig.plugins.push(new CopyPlugin([{
      from: 'static',
      to: './'
    }]))
  }

  // installed by `yarn global add`
  if (isYarn(__dirname)) {
    // modules in yarn global node_modules
    // because of yarn's flat node_modules structure
    webpackConfig.resolve.modules.push(ownDir('..'))
    // loaders in yarn global node_modules
    webpackConfig.resolveLoader.modules.push(ownDir('..'))
  }

  if (cliOptions.dev) {
    webpackConfig.devtool = 'eval-source-map'

    if (options.hot && !options.watch) {
      const hmrEntry = options.hmrEntry
      const hmrClient = require.resolve('webpack-hot-middleware/client') + `?reload=true&path=http://${options.host}:${options.port}/__webpack_hmr`
      for (const entry of hmrEntry) {
        webpackConfig.entry[entry].unshift(hmrClient)
      }

      webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
    }
  } else {
    const ProgressPlugin = require('webpack/lib/ProgressPlugin')
    const NoEmitOnErrorsPlugin = require('webpack/lib/NoEmitOnErrorsPlugin')

    webpackConfig.devtool = 'source-map'

    webpackConfig.plugins.push(
      new ProgressPlugin(),
      new NoEmitOnErrorsPlugin(),
      new ExtractTextPlugin(filename.css),
      /* eslint-disable camelcase */
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compressor: {
          warnings: false,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true,
          negate_iife: false
        },
        output: {
          comments: false
        }
        /* eslint-enable camelcase */
      })
    )

    if (options.vendor !== false) {
      webpackConfig.plugins.push(
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor',
          minChunks: module => {
            return module.resource && /\.js$/.test(module.resource) && module.resource.indexOf('node_modules') !== -1
          }
        }),
        new webpack.optimize.CommonsChunkPlugin({
          name: 'manifest'
        })
      )
    }
  }

  // merge webpack config
  if (typeof options.webpack === 'function') {
    webpackConfig = options.webpack(webpackConfig)
  } else if (typeof options.webpack === 'object') {
    webpackConfig = webpackMerge.smart(webpackConfig, options.webpack)
  }

  const server = run(webpackConfig, options)

  if (cliOptions.dev || cliOptions.watch) {
    const configFile = getConfigFile(options.config)
    if (configFile) {
      let watcher = fs.watch(configFile, e => {
        if (e === 'rename') {
          return
        }
        if (server) {
          server.close()
        }
        if (watcher) {
          watcher.close()
          watcher = null
        }
        console.log(`> Detect changes from ${chalk.yellow(configFile)}, restarting...\n`)
        start(cliOptions)
      })
    }
  }
}

function getFilenames(options) {
  return Object.assign({
    js: options.dev ? '[name].js' : '[name].[chunkhash:8].js',
    css: options.dev ? '[name].css' : '[name].[contenthash:8].css',
    static: options.dev ? 'static/[name].[ext]' : 'static/[name].[hash:8].[ext]'
  }, options.filename)
}

module.exports = start
