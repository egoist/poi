const chalk = require('chalk')
const webpack = require('webpack')
const fs = require('mz/fs')
const merge = require('lodash.merge')
const HtmlPlugin = require('html-webpack-plugin')
const PostCompilePlugin = require('post-compile-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const isYarn = require('installed-by-yarn-globally')
const webpackMerge = require('webpack-merge')
const { cwd, ownDir, getPublicPath, ensureEntry, inferHTML, readPkg } = require('./utils')
const run = require('./run')
const loaders = require('./loaders')
const AppError = require('./app-error')

function getConfig(config = {}) { // eslint-disable-line complexity
  const pkg = readPkg()

  let options = Object.assign({
    entry: pkg.main || 'index.js',
    dist: 'dist',
    appDir: 'src',
    homepage: pkg.homepage,
    html: {},
    stats: {
      chunks: false,
      children: false,
      modules: false,
      colors: true
    },
    copy: fs.existsSync('./static') ? [{
      from: './static',
      dist: './',
      ignore: ['.DS_Store']
    }] : []
  }, config)

  if (options.dev) {
    options = Object.assign({
      host: 'localhost',
      port: 4000,
      hot: true,
      hmrEntry: ['client'],
      hmrLog: true,
      sourceMap: 'eval-source-map',
      hotSocketPath: '/__webpack_hmr'
    }, options)
  } else {
    options = Object.assign({
      vendor: true,
      minimize: true,
      sourceMap: 'source-map',
      extract: true,
      cleanDist: true,
      progress: true
    }, options)
  }

  const postcssOptions = options.postcss
  if (options.autoprefixer !== false) {
    const autoprefixerPlugin = require('autoprefixer')(Object.assign({
      browsers: ['ie > 8', 'last 4 versions']
    }, options.autoprefixer))

    // `postcss` is set and `autoprefixer` is not disabled
    // then we add `autoprefixer` to it
    // only consider this when it's `Array` or `Object`
    if (Array.isArray(postcssOptions)) {
      postcssOptions.push(autoprefixerPlugin)
    } else if (typeof postcssOptions === 'object') {
      postcssOptions.plugins = postcssOptions.plugins || []
      postcssOptions.plugins.push(autoprefixerPlugin)
    }
  }

  const env = options.env
  const stringifiedEnv = {}
  for (const k in env) {
    stringifiedEnv[k] = JSON.stringify(env[k])
  }

  const filename = getFilenames(options)

  const cssOptions = {
    extract: options.extract,
    sourceMap: Boolean(options.sourceMap),
    cssModules: options.cssModules
  }

  let webpackConfig = {
    entry: { client: [] },
    devtool: options.sourceMap,
    output: {
      path: cwd(options.dist),
      publicPath: getPublicPath(options.homepage, options.dev),
      filename: filename.js,
      chunkFilename: filename.chunk
    },
    performance: {
      hints: false
    },
    resolve: {
      extensions: ['.js', '.json', '.vue', '.css'],
      modules: [
        cwd(),
        cwd('node_modules'),
        ownDir('node_modules')
      ],
      alias: {
        '@': cwd(options.appDir),
        vue$: options.templateCompiler ? 'vue/dist/vue.esm.js' : 'vue/dist/vue.runtime.esm.js',
        __WEBPACK_HOT_MIDDLEWARE_CLIENT__: `webpack-hot-middleware/client?path=${options.hotSocketPath}&reload=true${options.hmrLog ? '' : '&noInfo=true'}`
      }
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
          include(filepath) {
            // for anything outside node_modules
            if (filepath.split(/[/\\]/).indexOf('node_modules') === -1) {
              return true
            }
            // specific modules that need to be transpiled by babel
            if (options.transpileModules) {
              for (const name of options.transpileModules) {
                if (filepath.indexOf(`/node_modules/${name}/`) !== -1) {
                  return true
                }
              }
            }
          }
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
            if (stats.hasErrors()) {
              console.log(chalk.bgRed.black(' ERROR '), 'Compiled with errors!')
            } else if (stats.hasWarnings()) {
              console.log(chalk.bgYellow.black(' WARN '), 'Compiled with warnings!')
            }
          } else {
            console.log(stats.toString(options.stats))
            if (webpackConfig.target === 'electron-renderer') {
              console.log(chalk.bold(`\n> Open Electron in another tab\n`))
            } else {
              console.log(chalk.bold(`\n> Open http://${options.host}:${options.port}\n`))
            }
            console.log(chalk.bgGreen.black(' DONE '), 'Compiled successfully!')
          }
          console.log()
        }
      }),
      new webpack.DefinePlugin(merge({
        process: {
          env: stringifiedEnv
        }
      }, options.define)),
      new webpack.LoaderOptionsPlugin({
        minimize: !options.dev && options.minimize,
        options: {
          context: cwd(),
          babel: options.babel,
          postcss: postcssOptions,
          vue: {
            postcss: postcssOptions,
            loaders: Object.assign(loaders.cssLoaders(cssOptions), {
              js: 'babel-loader'
            }),
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
    webpackConfig.entry = ensureEntry(options.entry)
    // remove default `client` entry if it's empty
    // to prevent from webpack validation error
    if (webpackConfig.entry.client && (webpackConfig.entry.client.length === 0)) {
      delete webpackConfig.entry.client
      // do not add hmr entry either
      if (options.dev) {
        options.hmrEntry = options.hmrEntry.filter(e => e !== 'client')
      }
    }
  }

  if (options.format === 'cjs') {
    webpackConfig.output.libraryTarget = 'commonjs2'
    webpackConfig.externals = [
      // the modules in $cwd/node_modules
      require('webpack-node-externals')(),
      // modules that might be loaded from vbuild/node_modules
      'vue',
      'babel-runtime'
    ]
  } else if (options.format === 'umd') {
    webpackConfig.output.libraryTarget = 'umd'

    if (options.moduleName) {
      webpackConfig.output.library = options.moduleName
    } else {
      throw new AppError('> `moduleName` is required when bundling in `umd` format')
    }
  }

  if (options.html) {
    const htmlDefaults = inferHTML(options)

    if (Array.isArray(options.html)) {
      webpackConfig.plugins = webpackConfig.plugins.concat(options.html.map(html => new HtmlPlugin(Object.assign({}, htmlDefaults, html))))
    } else {
      webpackConfig.plugins.push(new HtmlPlugin(Object.assign({}, htmlDefaults, options.html)))
    }
  }

  if (options.eslint) {
    webpackConfig.module.rules.push({
      test: /\.(vue|js)$/,
      loader: 'eslint-loader',
      enforce: 'pre',
      exclude: [/node_modules/],
      options: Object.assign({
        configFile: require.resolve('eslint-config-vue-app')
      }, options.eslintConfig)
    })
  }

  if (options.extract) {
    webpackConfig.plugins.push(
      new ExtractTextPlugin({
        filename: filename.css,
        allChunks: true
      })
    )
  }

  // If `copy` is an array, copy specific folder
  // by default it copies ./static/** to ./dist/**
  if (Array.isArray(options.copy) && options.copy.length > 0) {
    webpackConfig.plugins.push(new CopyPlugin(options.copy))
  }

  // installed by `yarn global add`
  if (isYarn(__dirname)) {
    // modules in yarn global node_modules
    // because of yarn's flat node_modules structure
    webpackConfig.resolve.modules.push(ownDir('..'))
    // loaders in yarn global node_modules
    webpackConfig.resolveLoader.modules.push(ownDir('..'))
  }

  if (options.dev) {
    if (options.hot && !options.watch) {
      const hmrEntry = options.hmrEntry
      for (const entry of hmrEntry) {
        webpackConfig.entry[entry] = Array.isArray(webpackConfig.entry[entry]) ?
          webpackConfig.entry[entry] :
          [webpackConfig.entry[entry]]
        webpackConfig.entry[entry].unshift(ownDir('lib/dev-client.es6'))
      }

      webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
    }
  } else {
    const ProgressPlugin = require('webpack/lib/ProgressPlugin')
    const NoEmitOnErrorsPlugin = require('webpack/lib/NoEmitOnErrorsPlugin')

    if (options.progress) {
      webpackConfig.plugins.push(new ProgressPlugin())
    }

    webpackConfig.plugins.push(new NoEmitOnErrorsPlugin())

    // minimize is `true` by default in production mode
    if (options.minimize) {
      webpackConfig.plugins.push(
        /* eslint-disable camelcase */
        new webpack.optimize.UglifyJsPlugin({
          sourceMap: Boolean(options.sourceMap),
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
    }

    // Do not split vendor in `cjs` and `umd` format
    if (options.vendor && !options.format) {
      webpackConfig.plugins.push(
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor',
          minChunks: module => {
            return module.resource && /\.(js|css|es6)$/.test(module.resource) && module.resource.indexOf('node_modules') !== -1
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

  return {
    webpackConfig,
    options
  }
}

function getFilenames(options) {
  const excludeHash = options.dev || options.format
  return Object.assign({
    js: excludeHash ? '[name].js' : '[name].[chunkhash:8].js',
    css: excludeHash ? '[name].css' : '[name].[contenthash:8].css',
    static: excludeHash ? 'static/[name].[ext]' : 'static/[name].[hash:8].[ext]',
    chunk: excludeHash ? '[id].chunk.js' : '[id].[chunkhash:8].chunk.js'
  }, options.filename)
}

const vbuild = module.exports = function (config) {
  const { webpackConfig, options } = getConfig(config)

  return run(webpackConfig, options)
}

vbuild.getConfig = getConfig
