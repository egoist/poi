const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const PostCompilePlugin = require('post-compile-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const rm = require('rimraf')
const isYarn = require('installed-by-yarn-globally')
const webpackMerge = require('webpack-merge')
const {cwd, ownDir} = require('./utils')
const run = require('./run')
const loaders = require('./loaders')
const loadConfig = require('./load-config')

module.exports = function (options) {
  const userConfig = loadConfig(options)

  options = Object.assign({
    entry: 'index.js',
    dist: 'dist',
    html: {},
    babel: {
      cacheDirectory: true,
      sourceMaps: options.dev ? false : 'both',
      presets: [require.resolve('babel-preset-vue-app')]
    },
    postcss: [require('autoprefixer')(Object.assign({
      browsers: ['ie > 8', 'last 4 versions']
    }, userConfig.autoprefixer))],
    stats: {
      chunks: false,
      children: false,
      modules: false,
      colors: true
    }
  }, userConfig, options)

  if (options.dev) {
    options = Object.assign({
      host: 'localhost',
      port: 4000,
      hot: true,
      hmrEntry: ['client']
    }, options)
  } else {
    options = Object.assign({}, options)
  }

  const filename = getFilenames(options)

  const cssOptions = {
    extract: !options.dev,
    sourceMap: true
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
        ownDir('node_modules'),
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
        }
      ].concat(loaders.styleLoaders(cssOptions))
    },
    plugins: [
      new PostCompilePlugin(stats => {
        process.stdout.write('\x1Bc')

        if (options.dev) {
          if (stats.hasErrors() || stats.hasWarnings()) {
            console.log(stats.toString('errors-only'))
            console.log()
            console.log(chalk.bgRed.black(' ERROR '), 'Compiling failed!')
          } else {
            console.log(stats.toString(options.stats))
            console.log(chalk.bold(`\n> Open http://localhost:${options.port}\n`))
            console.log(chalk.bgGreen.black(' DONE '), 'Compiled successfully!')
          }
          console.log()
        }
      }),
      new webpack.DefinePlugin({
        'proess.env.NODE_ENV': JSON.stringify(options.dev ? 'development' : 'production')
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: !options.dev,
        options: {
          context: cwd(),
          babel: options.babel,
          postcss: options.postcss,
          vue: {
            postcss: options.postcss,
            loaders: loaders.cssLoaders(cssOptions)
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

  if (options.dev) {
    webpackConfig.devtool = 'eval-source-map'

    if (options.hot) {
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
      })
    )

    if (options.vendor) {
      webpackConfig.entry.vendor = options.vendor
      webpackConfig.plugins.push(
        new webpack.optimize.CommonsChunkPlugin({
          names: ['vendor', 'manifest']
        })
      )
    }
  }

  // merge webpack config
  if (typeof options.webpack === 'function') {
    webpackConfig = options.webpack(webpackConfig)
  } else if (typeof options.webpack === 'object') {
    webpackConfig = webpackMerge(webpackConfig, options.webpack)
  }

  run(webpackConfig, options)
}

function getFilenames (options) {
  return Object.assign({
    js: options.dev ? '[name].js' : '[name].[chunkhash:8].js',
    css: options.dev ? '[name].css' : '[name].[contenthash:8].css',
    static: options.dev ? 'static/[name].[ext]' : 'static/[name].[hash:8].[ext]'
  }, options.filename)
}
